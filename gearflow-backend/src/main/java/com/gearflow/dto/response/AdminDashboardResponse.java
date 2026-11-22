package com.gearflow.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class AdminDashboardResponse {
    private long totalGarages;
    private long activeGarages;
    private long inactiveGarages;
    private long pendingGarages;
    private long totalOwners;
    private long totalCustomers;
    private BigDecimal totalRevenue;
    private List<Map<String, Object>> monthlyRegistrations;
    private List<Map<String, Object>> garageStatusDistribution;
    private List<Map<String, Object>> recentGarages;
}

