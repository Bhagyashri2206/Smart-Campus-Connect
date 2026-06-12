package com.campusconnect.service;

import com.campusconnect.dto.UpdateProfileRequest;
import com.campusconnect.dto.UserResponse;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.model.Role;
import com.campusconnect.model.User;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserResponse> getAllUsers() {
        Long currentUserId = getCurrentUserId();
        return userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(currentUserId))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<UserResponse> searchUsers(String query, Role role) {
        Long currentUserId = getCurrentUserId();
        List<User> users;

        if (role != null && query != null && !query.isBlank()) {
            users = userRepository.searchUsersByRole(query, role);
        } else if (role != null) {
            users = userRepository.findByRole(role);
        } else if (query != null && !query.isBlank()) {
            users = userRepository.searchUsers(query);
        } else {
            users = userRepository.findAll();
        }

        return users.stream()
                .filter(u -> !u.getId().equals(currentUserId))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();

        user.setDepartment(request.getDepartment().trim());
        user.setStatusMessage(
                request.getStatusMessage() != null ? request.getStatusMessage().trim() : null);
        user.setProfilePicUrl(
                request.getProfilePicUrl() != null && !request.getProfilePicUrl().isBlank()
                        ? request.getProfilePicUrl().trim()
                        : null);

        user = userRepository.save(user);
        return toResponse(user);
    }

    public UserResponse getCurrentUserProfile() {
        return toResponse(getCurrentUser());
    }

    @Transactional
    public void setOnlineStatus(Long userId, boolean online) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setOnlineStatus(online);
        userRepository.save(user);
    }

    public User getCurrentUser() {
        CustomUserDetails details = getCurrentUserDetails();
        return details.getUser();
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    private CustomUserDetails getCurrentUserDetails() {
        return (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .department(user.getDepartment())
                .statusMessage(user.getStatusMessage())
                .profilePicUrl(user.getProfilePicUrl())
                .onlineStatus(user.getOnlineStatus())
                .build();
    }
}
