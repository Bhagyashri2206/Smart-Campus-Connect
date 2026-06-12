package com.campusconnect.websocket;

import com.campusconnect.dto.MessageRequest;
import com.campusconnect.dto.MessageResponse;
import com.campusconnect.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final MessageService messageService;
    private final MessageBroadcastService messageBroadcastService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageRequest request, Principal principal) {
        Long senderId = Long.parseLong(principal.getName());
        MessageResponse saved = messageService.sendMessage(request, senderId);
        messageBroadcastService.broadcast(saved);
    }
}
