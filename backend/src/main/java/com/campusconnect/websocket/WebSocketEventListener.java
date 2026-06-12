package com.campusconnect.websocket;

import com.campusconnect.security.StompPrincipal;
import com.campusconnect.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        resolveUserId(accessor).ifPresent(userId -> {
            userService.setOnlineStatus(userId, true);
            var user = userService.getUserById(userId);
            broadcastPresence(userId, user.getName(), true);
        });
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        resolveUserId(accessor).ifPresent(userId -> {
            userService.setOnlineStatus(userId, false);
            var user = userService.getUserById(userId);
            broadcastPresence(userId, user.getName(), false);
        });
    }

    private java.util.Optional<Long> resolveUserId(StompHeaderAccessor accessor) {
        if (accessor.getUser() instanceof StompPrincipal stompPrincipal) {
            return java.util.Optional.of(Long.parseLong(stompPrincipal.getName()));
        }
        if (accessor.getSessionAttributes() != null) {
            Object userId = accessor.getSessionAttributes().get("userId");
            if (userId instanceof Long id) {
                return java.util.Optional.of(id);
            }
        }
        return java.util.Optional.empty();
    }

    private void broadcastPresence(Long userId, String name, boolean online) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", userId);
        payload.put("name", name);
        payload.put("online", online);
        messagingTemplate.convertAndSend("/topic/presence", payload);
    }
}
