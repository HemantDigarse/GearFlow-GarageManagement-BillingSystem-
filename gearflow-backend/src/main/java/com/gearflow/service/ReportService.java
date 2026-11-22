package com.gearflow.service;

import com.gearflow.entity.Garage;
import com.gearflow.enums.JobStatus;
import com.gearflow.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final JobCardRepository jobCardRepository;
    private final GarageServiceRepository garageServiceRepository;
    private final EmployeeRepository employeeRepository;
    private final AuthService authService;

    public ReportService(InvoiceRepository invoiceRepository, PaymentRepository paymentRepository,
                         JobCardRepository jobCardRepository, GarageServiceRepository garageServiceRepository,
                         EmployeeRepository employeeRepository, AuthService authService) {
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.jobCardRepository = jobCardRepository;
        this.garageServiceRepository = garageServiceRepository;
        this.employeeRepository = employeeRepository;
        this.authService = authService;
    }

    public Map<String, Object> getRevenueReport(String period) {
        Garage garage = authService.getGarageForCurrentUser();
        Map<String, Object> report = new HashMap<>();
        report.put("totalRevenue", invoiceRepository.sumGrandTotalByGarageId(garage.getId()));
        report.put("pendingPayments", invoiceRepository.sumRemainingBalanceByGarageId(garage.getId()));
        report.put("totalInvoices", invoiceRepository.countByGarageId(garage.getId()));

        // Monthly revenue breakdown
        List<Map<String, Object>> revenueData = invoiceRepository.findByGarageId(garage.getId()).stream()
                .filter(inv -> inv.getInvoiceDate() != null)
                .collect(Collectors.groupingBy(inv -> inv.getInvoiceDate().getMonth().name()))
                .entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("period", e.getKey());
                    m.put("revenue", e.getValue().stream().map(i -> i.getGrandTotal()).reduce(BigDecimal.ZERO, BigDecimal::add));
                    m.put("count", e.getValue().size());
                    return m;
                }).collect(Collectors.toList());
        report.put("revenueData", revenueData);
        return report;
    }

    public Map<String, Object> getServiceReport() {
        Garage garage = authService.getGarageForCurrentUser();
        Map<String, Object> report = new HashMap<>();

        List<Map<String, Object>> serviceData = garageServiceRepository.findByGarageId(garage.getId()).stream()
                .map(s -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("serviceName", s.getName());
                    m.put("price", s.getPrice());
                    m.put("active", s.isActive());
                    return m;
                }).collect(Collectors.toList());
        report.put("services", serviceData);
        report.put("totalServices", garageServiceRepository.countByGarageId(garage.getId()));
        return report;
    }

    public Map<String, Object> getPaymentReport(String status) {
        Garage garage = authService.getGarageForCurrentUser();
        Map<String, Object> report = new HashMap<>();
        report.put("totalCollected", paymentRepository.sumAmountByGarageId(garage.getId()));
        report.put("totalPending", invoiceRepository.sumRemainingBalanceByGarageId(garage.getId()));

        List<Map<String, Object>> paymentData = paymentRepository.findByGarageId(garage.getId()).stream()
                .map(p -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("date", p.getPaymentDate());
                    m.put("amount", p.getAmount());
                    m.put("method", p.getPaymentMethod().name());
                    m.put("customer", p.getCustomer().getName());
                    m.put("invoice", p.getInvoice().getInvoiceNumber());
                    return m;
                }).collect(Collectors.toList());
        report.put("payments", paymentData);
        return report;
    }

    public Map<String, Object> getEmployeeReport() {
        Garage garage = authService.getGarageForCurrentUser();
        Map<String, Object> report = new HashMap<>();

        List<Map<String, Object>> employeeData = employeeRepository.findByGarageId(garage.getId()).stream()
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("name", e.getName());
                    m.put("designation", e.getDesignation());
                    m.put("status", e.getStatus().name());
                    m.put("assignedJobs", jobCardRepository.findByAssignedEmployeeId(e.getId()).size());
                    m.put("completedJobs", jobCardRepository.countByAssignedEmployeeIdAndStatus(e.getId(), JobStatus.COMPLETED));
                    return m;
                }).collect(Collectors.toList());
        report.put("employees", employeeData);
        return report;
    }
}

