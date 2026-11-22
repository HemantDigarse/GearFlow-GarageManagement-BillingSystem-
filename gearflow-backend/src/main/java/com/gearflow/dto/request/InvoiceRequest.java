package com.gearflow.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class InvoiceRequest {
    private BigDecimal sparePartsCharges;
    private BigDecimal labourCharges;
    private BigDecimal taxPercentage;
    private BigDecimal discount;
    private String notes;
}

