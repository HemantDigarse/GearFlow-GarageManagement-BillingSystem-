package com.gearflow.dto.response;

import lombok.Data;

@Data
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String role;
    private boolean active;
    private String garageName;
    private Long garageId;
}

