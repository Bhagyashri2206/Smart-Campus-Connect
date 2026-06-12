package com.campusconnect.websocket;

import com.campusconnect.dto.MessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MessageBroadcastService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcast(MessageResponse saved) {
        ChatMessage chatMessage = ChatMessage.builder()
                .id(saved.getId())
                .senderId(saved.getSenderId())
                .senderName(saved.getSenderName())
                .receiverId(saved.getReceiverId())
                .receiverName(saved.getReceiverName())
                .content(saved.getContent())
                .timestamp(saved.getTimestamp())
                .status(saved.getStatus())
                .build();

        messagingTemplate.convertAndSendToUser(
                saved.getReceiverId().toString(),
                "/queue/messages",
                chatMessage);

        messagingTemplate.convertAndSendToUser(
                saved.getSenderId().toString(),
                "/queue/messages",
                chatMessage);
    }

    public void broadcastStatusUpdate(MessageResponse updated) {
        ChatMessage statusPayload = ChatMessage.builder()
                .id(updated.getId())
                .senderId(updated.getSenderId())
                .senderName(updated.getSenderName())
                .receiverId(updated.getReceiverId())
                .receiverName(updated.getReceiverName())
                .content(updated.getContent())
                .timestamp(updated.getTimestamp())
                .status(updated.getStatus())
                .build();

        messagingTemplate.convertAndSendToUser(
                updated.getSenderId().toString(),
                "/queue/status",
                statusPayload);

        messagingTemplate.convertAndSendToUser(
                updated.getReceiverId().toString(),
                "/queue/status",
                statusPayload);
    }
}
