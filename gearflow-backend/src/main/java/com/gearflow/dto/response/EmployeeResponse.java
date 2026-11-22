package com.gearflow.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EmployeeResponse {
    private Long id;
    private String name;
    private String mobile;
    private String email;
    private String designation;
    private BigDecimal salary;
    private LocalDate joiningDate;
    private String status;
    private long assignedJobs;
    private long completedJobs;
}

