package com.gearflow.controller;

import com.gearflow.dto.response.ApiResponse;
import com.gearflow.dto.response.GarageDashboardResponse;
import com.gearflow.service.GarageDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/garage")
public class GarageDashboardController {

    private final GarageDashboardService garageDashboardService;

    public GarageDashboardController(GarageDashboardService garageDashboardService) {
        this.garageDashboardService = garageDashboardService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<GarageDashboardResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(garageDashboardService.getDashboard()));
    }
}

