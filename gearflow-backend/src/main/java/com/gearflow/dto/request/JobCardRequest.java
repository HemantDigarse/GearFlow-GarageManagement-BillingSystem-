package com.gearflow.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class JobCardRequest {
    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    private String problemDescription;
    private Long assignedEmployeeId;
    private LocalDate estimatedCompletionDate;
    private String priority;
    private String notes;
    private List<JobCardItemRequest> items;

    @Data
    public static class JobCardItemRequest {
        @NotNull(message = "Service ID is required")
        private Long serviceId;
        private Integer quantity = 1;
    }
}

