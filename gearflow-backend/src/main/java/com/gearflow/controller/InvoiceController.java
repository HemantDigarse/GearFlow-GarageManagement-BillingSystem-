package com.gearflow.controller;

import com.gearflow.dto.request.InvoiceRequest;
import com.gearflow.dto.response.ApiResponse;
import com.gearflow.dto.response.InvoiceResponse;
import com.gearflow.service.InvoiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/garage/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getAllInvoices(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getAllInvoices(status)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getInvoiceById(id)));
    }

    @PostMapping("/generate/{jobCardId}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> generateInvoice(@PathVariable Long jobCardId, @RequestBody InvoiceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Invoice generated", invoiceService.generateInvoice(jobCardId, request)));
    }
}

