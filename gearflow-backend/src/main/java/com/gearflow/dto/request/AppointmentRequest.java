package com.gearflow.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentRequest {
    @NotNull(message = "Customer ID is required")
    private Long customerId;

    private Long vehicleId;

    @NotNull(message = "Appointment date is required")
    private LocalDate appointmentDate;

    private LocalTime appointmentTime;
    private String serviceDescription;
    private String notes;
}

