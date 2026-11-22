package com.gearflow.dto.response;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerMobile;
    private Long vehicleId;
    private String vehicleRegNumber;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String serviceDescription;
    private String status;
    private String notes;
}

