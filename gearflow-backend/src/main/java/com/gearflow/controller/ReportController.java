package com.gearflow.controller;

import com.gearflow.dto.response.ApiResponse;
import com.gearflow.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/garage/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRevenueReport(@RequestParam(defaultValue = "monthly") String period) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getRevenueReport(period)));
    }

    @GetMapping("/services")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getServiceReport() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getServiceReport()));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPaymentReport(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getPaymentReport(status)));
    }

    @GetMapping("/employees")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEmployeeReport() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getEmployeeReport()));
    }
}

