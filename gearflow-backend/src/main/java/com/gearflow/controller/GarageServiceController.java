package com.gearflow.controller;

import com.gearflow.dto.request.ServiceRequest;
import com.gearflow.dto.response.ApiResponse;
import com.gearflow.dto.response.ServiceResponse;
import com.gearflow.service.GarageServiceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/garage/services")
public class GarageServiceController {

    private final GarageServiceService garageServiceService;

    public GarageServiceController(GarageServiceService garageServiceService) {
        this.garageServiceService = garageServiceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getAllServices() {
        return ResponseEntity.ok(ApiResponse.success(garageServiceService.getAllServices()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ServiceResponse>> createService(@Valid @RequestBody ServiceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Service created", garageServiceService.createService(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceResponse>> updateService(@PathVariable Long id, @Valid @RequestBody ServiceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Service updated", garageServiceService.updateService(id, request)));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<Void>> toggleServiceStatus(@PathVariable Long id) {
        garageServiceService.toggleServiceStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Service status toggled", null));
    }
}

