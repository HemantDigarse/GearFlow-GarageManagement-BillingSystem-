package com.gearflow.dto.response;

import lombok.Data;
import java.time.LocalDate;

@Data
public class VehicleResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private String registrationNumber;
    private String brand;
    private String model;
    private String vehicleType;
    private Integer manufacturingYear;
    private String fuelType;
    private LocalDate lastServiceDate;
}

