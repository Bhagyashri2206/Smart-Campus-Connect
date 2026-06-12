package com.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "Department is required")
    @Size(max = 100)
    private String department;

    @Size(max = 120)
    private String statusMessage;

    @Size(max = 512)
    private String profilePicUrl;
}
