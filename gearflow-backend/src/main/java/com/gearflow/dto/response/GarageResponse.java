package com.gearflow.dto.response;

import lombok.Data;
import java.time.LocalDate;

@Data
public class GarageResponse {
    private Long id;
    private String name;
    private String ownerName;
    private Long ownerId;
    private String ownerEmail;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String logoUrl;
    private String status;
    private LocalDate registrationDate;
    private long totalCustomers;
    private long totalEmployees;
    private long totalJobCards;
}

