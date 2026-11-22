package com.gearflow.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class GarageDashboardResponse {
    private long totalCustomers;
    private long totalVehicles;
    private long totalServices;
    private long pendingJobs;
    private long inProgressJobs;
    private long completedJobs;
    private long totalInvoices;
    private BigDecimal totalRevenue;
    private BigDecimal pendingPayments;
    private long todayAppointments;
    private List<Map<String, Object>> monthlyRevenue;
    private List<Map<String, Object>> dailyServiceOrders;
    private List<Map<String, Object>> jobStatusDistribution;
    private List<Map<String, Object>> popularServices;
    private List<Map<String, Object>> paymentStatusDistribution;
}

