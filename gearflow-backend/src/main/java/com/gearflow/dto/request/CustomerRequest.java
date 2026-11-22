package com.gearflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomerRequest {
    @NotBlank(message = "Customer name is required")
    private String name;

    @NotBlank(message = "Mobile number is required")
    private String mobile;

    private String email;
    private String address;
}

