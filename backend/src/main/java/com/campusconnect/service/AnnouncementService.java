package com.campusconnect.service;

import com.campusconnect.dto.AnnouncementRequest;
import com.campusconnect.dto.AnnouncementResponse;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.model.Announcement;
import com.campusconnect.model.Role;
import com.campusconnect.model.User;
import com.campusconnect.repository.AnnouncementRepository;
import com.campusconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public List<AnnouncementResponse> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByTimestampDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AnnouncementResponse createAnnouncement(AnnouncementRequest request) {
        User currentUser = userService.getCurrentUser();
        Role role = currentUser.getRole();

        if (role != Role.ADMIN && role != Role.TEACHER) {
            throw new BadRequestException("Only teachers and admins can create announcements");
        }

        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .createdBy(currentUser.getId())
                .timestamp(LocalDateTime.now())
                .build();

        announcement = announcementRepository.save(announcement);
        return toResponse(announcement);
    }

    public AnnouncementResponse getById(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found"));
        return toResponse(announcement);
    }

    private AnnouncementResponse toResponse(Announcement announcement) {
        String createdByName = userRepository.findById(announcement.getCreatedBy())
                .map(User::getName)
                .orElse("Unknown");

        return AnnouncementResponse.builder()
                .id(announcement.getId())
                .title(announcement.getTitle())
                .content(announcement.getContent())
                .createdBy(announcement.getCreatedBy())
                .createdByName(createdByName)
                .timestamp(announcement.getTimestamp())
                .build();
    }
}
