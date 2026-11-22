package com.gearflow.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class JobCardResponse {
    private Long id;
    private String jobCardNumber;
    private Long customerId;
    private String customerName;
    private String customerMobile;
    private Long vehicleId;
    private String vehicleRegNumber;
    private String vehicleBrand;
    private String vehicleModel;
    private Long assignedEmployeeId;
    private String assignedEmployeeName;
    private String problemDescription;
    private LocalDate estimatedCompletionDate;
    private String priority;
    private String status;
    private String notes;
    private BigDecimal totalAmount;
    private List<JobCardItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class JobCardItemResponse {
        private Long id;
        private Long serviceId;
        private String serviceName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
}

