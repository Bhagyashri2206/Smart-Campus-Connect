package com.campusconnect.websocket;

import com.campusconnect.dto.AnnouncementResponse;
import com.campusconnect.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AnnouncementWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastAnnouncement(AnnouncementResponse announcement) {
        AnnouncementPayload payload = AnnouncementPayload.builder()
                .id(announcement.getId())
                .title(announcement.getTitle())
                .content(announcement.getContent())
                .createdBy(announcement.getCreatedBy())
                .createdByName(announcement.getCreatedByName())
                .timestamp(announcement.getTimestamp())
                .build();

        messagingTemplate.convertAndSend("/topic/announcements", payload);
    }
}
