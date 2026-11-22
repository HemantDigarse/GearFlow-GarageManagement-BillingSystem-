package com.gearflow.controller;

import com.gearflow.dto.request.VehicleRequest;
import com.gearflow.dto.response.ApiResponse;
import com.gearflow.dto.response.VehicleResponse;
import com.gearflow.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/garage/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getAllVehicles() {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.getAllVehicles()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.getVehicleById(id)));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getVehiclesByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.getVehiclesByCustomer(customerId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VehicleResponse>> createVehicle(@Valid @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Vehicle registered", vehicleService.createVehicle(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicle(@PathVariable Long id, @Valid @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Vehicle updated", vehicleService.updateVehicle(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle deleted", null));
    }
}

