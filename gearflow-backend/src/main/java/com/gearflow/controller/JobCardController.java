package com.gearflow.controller;

import com.gearflow.dto.request.JobCardRequest;
import com.gearflow.dto.response.ApiResponse;
import com.gearflow.dto.response.JobCardResponse;
import com.gearflow.service.JobCardService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/garage/job-cards")
public class JobCardController {

    private final JobCardService jobCardService;

    public JobCardController(JobCardService jobCardService) {
        this.jobCardService = jobCardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobCardResponse>>> getAllJobCards(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(jobCardService.getAllJobCards(status)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobCardResponse>> getJobCardById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(jobCardService.getJobCardById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<JobCardResponse>> createJobCard(@Valid @RequestBody JobCardRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Job card created", jobCardService.createJobCard(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<JobCardResponse>> updateJobCard(@PathVariable Long id, @RequestBody JobCardRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Job card updated", jobCardService.updateJobCard(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateJobCardStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        jobCardService.updateJobCardStatus(id, body.get("status"));
        return ResponseEntity.ok(ApiResponse.success("Job card status updated", null));
    }
}

