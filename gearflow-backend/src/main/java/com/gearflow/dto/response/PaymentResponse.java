package com.gearflow.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentResponse {
    private Long id;
    private Long invoiceId;
    private String invoiceNumber;
    private Long customerId;
    private String customerName;
    private BigDecimal amount;
    private String paymentMethod;
    private LocalDateTime paymentDate;
    private String transactionReference;
    private String notes;
}

