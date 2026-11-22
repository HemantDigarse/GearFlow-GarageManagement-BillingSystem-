package com.gearflow.dto.response;

import lombok.Data;
import java.time.LocalDate;

@Data
public class CustomerResponse {
    private Long id;
    private String name;
    private String mobile;
    private String email;
    private String address;
    private LocalDate registrationDate;
    private long vehicleCount;
}

