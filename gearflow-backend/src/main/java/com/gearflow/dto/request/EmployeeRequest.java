package com.gearflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EmployeeRequest {
    @NotBlank(message = "Employee name is required")
    private String name;

    @NotBlank(message = "Mobile number is required")
    private String mobile;

    private String email;
    private String designation;
    private BigDecimal salary;
    private LocalDate joiningDate;
}

