package com.gearflow.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class InvoiceResponse {
    private Long id;
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private Long jobCardId;
    private String jobCardNumber;
    private Long customerId;
    private String customerName;
    private String customerMobile;
    private String customerEmail;
    private String customerAddress;
    private String vehicleRegNumber;
    private String vehicleBrand;
    private String vehicleModel;
    private String garageName;
    private String garageAddress;
    private String garagePhone;
    private String garageEmail;
    private BigDecimal serviceCharges;
    private BigDecimal sparePartsCharges;
    private BigDecimal labourCharges;
    private BigDecimal taxPercentage;
    private BigDecimal taxAmount;
    private BigDecimal discount;
    private BigDecimal grandTotal;
    private BigDecimal amountPaid;
    private BigDecimal remainingBalance;
    private String status;
    private String notes;
    private List<InvoiceItemResponse> items;
    private LocalDateTime createdAt;

    @Data
    public static class InvoiceItemResponse {
        private Long id;
        private String description;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
}

