package com.gearflow.controller;

import com.gearflow.dto.response.AdminDashboardResponse;
import com.gearflow.dto.response.ApiResponse;
import com.gearflow.entity.ActivityLog;
import com.gearflow.service.ActivityLogService;
import com.gearflow.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminDashboardController {

    private final AdminService adminService;
    private final ActivityLogService activityLogService;

    public AdminDashboardController(AdminService adminService, ActivityLogService activityLogService) {
        this.adminService = adminService;
        this.activityLogService = activityLogService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboard()));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAnalytics()));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<ApiResponse<List<ActivityLog>>> getActivityLogs() {
        return ResponseEntity.ok(ApiResponse.success(activityLogService.getAllLogs()));
    }
}

