package com.campusconnect.service;

import com.campusconnect.dto.MessageRequest;
import com.campusconnect.dto.MessageResponse;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.model.Message;
import com.campusconnect.model.MessageStatus;
import com.campusconnect.model.User;
import com.campusconnect.repository.MessageRepository;
import com.campusconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campusconnect.dto.UnreadCountResponse;
import com.campusconnect.websocket.MessageBroadcastService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final MessageBroadcastService messageBroadcastService;

    public List<MessageResponse> getConversation(Long otherUserId) {
        Long currentUserId = userService.getCurrentUserId();
        userRepository.findById(otherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return messageRepository.findConversation(currentUserId, otherUserId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse sendMessage(MessageRequest request) {
        return sendMessage(request, userService.getCurrentUserId());
    }

    @Transactional
    public MessageResponse sendMessage(MessageRequest request, Long senderId) {
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        Message message = Message.builder()
                .senderId(senderId)
                .receiverId(receiver.getId())
                .content(request.getContent())
                .timestamp(LocalDateTime.now())
                .status(MessageStatus.SENT)
                .build();

        message = messageRepository.save(message);

        if (Boolean.TRUE.equals(receiver.getOnlineStatus()) && message.getStatus() == MessageStatus.SENT) {
            message.setStatus(MessageStatus.DELIVERED);
            message = messageRepository.save(message);
        }

        return toResponse(message);
    }

    public UnreadCountResponse getUnreadCounts() {
        Long currentUserId = userService.getCurrentUserId();
        Map<Long, Long> countsByUser = new HashMap<>();
        long total = 0;

        for (Object[] row : messageRepository.countUnreadGroupedBySender(currentUserId, MessageStatus.READ)) {
            Long senderId = (Long) row[0];
            Long count = (Long) row[1];
            countsByUser.put(senderId, count);
            total += count;
        }

        return UnreadCountResponse.builder()
                .countsByUser(countsByUser)
                .total(total)
                .build();
    }

    @Transactional
    public MessageResponse markAsDelivered(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        Long currentUserId = userService.getCurrentUserId();
        if (!message.getReceiverId().equals(currentUserId)) {
            throw new ResourceNotFoundException("Message not found");
        }

        if (message.getStatus() == MessageStatus.SENT) {
            message.setStatus(MessageStatus.DELIVERED);
            message = messageRepository.save(message);
            MessageResponse response = toResponse(message);
            messageBroadcastService.broadcastStatusUpdate(response);
            return response;
        }

        return toResponse(message);
    }

    @Transactional
    public MessageResponse markAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        Long currentUserId = userService.getCurrentUserId();
        if (!message.getReceiverId().equals(currentUserId)) {
            throw new ResourceNotFoundException("Message not found");
        }

        message.setStatus(MessageStatus.READ);
        message = messageRepository.save(message);
        MessageResponse response = toResponse(message);
        messageBroadcastService.broadcastStatusUpdate(response);
        return response;
    }

    @Transactional
    public List<MessageResponse> markConversationAsRead(Long otherUserId) {
        Long currentUserId = userService.getCurrentUserId();
        List<Message> messages = messageRepository.findConversation(currentUserId, otherUserId);
        List<MessageResponse> updated = new ArrayList<>();

        for (Message message : messages) {
            if (message.getReceiverId().equals(currentUserId) && message.getStatus() != MessageStatus.READ) {
                message.setStatus(MessageStatus.READ);
                message = messageRepository.save(message);
                MessageResponse response = toResponse(message);
                updated.add(response);
                messageBroadcastService.broadcastStatusUpdate(response);
            }
        }
        return updated;
    }

    private MessageResponse toResponse(Message message) {
        Map<Long, User> userMap = userRepository.findAllById(
                List.of(message.getSenderId(), message.getReceiverId())
        ).stream().collect(Collectors.toMap(User::getId, u -> u));

        User sender = userMap.get(message.getSenderId());
        User receiver = userMap.get(message.getReceiverId());

        return MessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSenderId())
                .senderName(sender != null ? sender.getName() : "Unknown")
                .receiverId(message.getReceiverId())
                .receiverName(receiver != null ? receiver.getName() : "Unknown")
                .content(message.getContent())
                .timestamp(message.getTimestamp())
                .status(message.getStatus())
                .build();
    }
}
