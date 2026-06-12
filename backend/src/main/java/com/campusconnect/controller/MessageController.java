package com.campusconnect.controller;

import com.campusconnect.dto.MessageRequest;
import com.campusconnect.dto.MessageResponse;
import com.campusconnect.dto.UnreadCountResponse;
import com.campusconnect.service.MessageService;
import com.campusconnect.websocket.MessageBroadcastService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final MessageBroadcastService messageBroadcastService;

    @GetMapping("/unread-counts")
    public ResponseEntity<UnreadCountResponse> getUnreadCounts() {
        return ResponseEntity.ok(messageService.getUnreadCounts());
    }

    @GetMapping("/conversation/{userId}")
    public ResponseEntity<List<MessageResponse>> getConversation(@PathVariable Long userId) {
        messageService.markConversationAsRead(userId);
        return ResponseEntity.ok(messageService.getConversation(userId));
    }

    @PutMapping("/{id}/delivered")
    public ResponseEntity<MessageResponse> markAsDelivered(@PathVariable Long id) {
        return ResponseEntity.ok(messageService.markAsDelivered(id));
    }

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(@Valid @RequestBody MessageRequest request) {
        MessageResponse saved = messageService.sendMessage(request);
        messageBroadcastService.broadcast(saved);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<MessageResponse> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(messageService.markAsRead(id));
    }
}
