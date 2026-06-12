package com.campusconnect.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementPayload {

    private Long id;
    private String title;
    private String content;
    private Long createdBy;
    private String createdByName;
    private LocalDateTime timestamp;
}
