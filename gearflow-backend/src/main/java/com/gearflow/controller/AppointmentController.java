package com.gearflow.controller;

import com.gearflow.dto.request.AppointmentRequest;
import com.gearflow.dto.response.ApiResponse;
import com.gearflow.dto.response.AppointmentResponse;
import com.gearflow.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/garage/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAllAppointments() {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getAllAppointments()));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getTodayAppointments() {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getTodayAppointments()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(@Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Appointment created", appointmentService.createAppointment(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateAppointment(@PathVariable Long id, @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Appointment updated", appointmentService.updateAppointment(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateAppointmentStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        appointmentService.updateAppointmentStatus(id, body.get("status"));
        return ResponseEntity.ok(ApiResponse.success("Appointment status updated", null));
    }
}

