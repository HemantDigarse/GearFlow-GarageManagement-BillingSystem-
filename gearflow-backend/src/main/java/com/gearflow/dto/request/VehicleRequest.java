package com.gearflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VehicleRequest {
    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    private String brand;
    private String model;
    private String vehicleType;
    private Integer manufacturingYear;
    private String fuelType;
}

