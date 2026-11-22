package com.gearflow.controller;

import com.gearflow.dto.request.GarageRequest;
import com.gearflow.dto.response.ApiResponse;
import com.gearflow.dto.response.GarageResponse;
import com.gearflow.dto.response.UserResponse;
import com.gearflow.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminGarageController {

    private final AdminService adminService;

    public AdminGarageController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/garages")
    public ResponseEntity<ApiResponse<List<GarageResponse>>> getAllGarages(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllGarages(search, status)));
    }

    @GetMapping("/garages/{id}")
    public ResponseEntity<ApiResponse<GarageResponse>> getGarageById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getGarageById(id)));
    }

    @PostMapping("/garages")
    public ResponseEntity<ApiResponse<GarageResponse>> createGarage(@RequestBody GarageRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Garage created", adminService.createGarage(request)));
    }

    @PutMapping("/garages/{id}")
    public ResponseEntity<ApiResponse<GarageResponse>> updateGarage(@PathVariable Long id, @RequestBody GarageRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Garage updated", adminService.updateGarage(id, request)));
    }

    @PatchMapping("/garages/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateGarageStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        adminService.updateGarageStatus(id, body.get("status"));
        return ResponseEntity.ok(ApiResponse.success("Garage status updated", null));
    }

    @GetMapping("/owners")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllOwners() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllOwners()));
    }

    @GetMapping("/owners/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getOwnerById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getOwnerById(id)));
    }

    @PatchMapping("/owners/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateOwnerStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        adminService.updateOwnerStatus(id, body.get("active"));
        return ResponseEntity.ok(ApiResponse.success("Owner status updated", null));
    }
}

