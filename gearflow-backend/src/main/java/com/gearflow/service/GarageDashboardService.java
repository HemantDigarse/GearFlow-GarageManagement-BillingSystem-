package com.gearflow.service;

import com.gearflow.dto.response.GarageDashboardResponse;
import com.gearflow.entity.Garage;
import com.gearflow.enums.InvoiceStatus;
import com.gearflow.enums.JobStatus;
import com.gearflow.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GarageDashboardService {

    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final GarageServiceRepository garageServiceRepository;
    private final JobCardRepository jobCardRepository;
    private final InvoiceRepository invoiceRepository;
    private final AppointmentRepository appointmentRepository;
    private final AuthService authService;

    public GarageDashboardService(CustomerRepository customerRepository, VehicleRepository vehicleRepository,
                                   GarageServiceRepository garageServiceRepository, JobCardRepository jobCardRepository,
                                   InvoiceRepository invoiceRepository, AppointmentRepository appointmentRepository,
                                   AuthService authService) {
        this.customerRepository = customerRepository;
        this.vehicleRepository = vehicleRepository;
        this.garageServiceRepository = garageServiceRepository;
        this.jobCardRepository = jobCardRepository;
        this.invoiceRepository = invoiceRepository;
        this.appointmentRepository = appointmentRepository;
        this.authService = authService;
    }

    public GarageDashboardResponse getDashboard() {
        Garage garage = authService.getGarageForCurrentUser();
        Long garageId = garage.getId();

        GarageDashboardResponse r = new GarageDashboardResponse();
        r.setTotalCustomers(customerRepository.countByGarageId(garageId));
        r.setTotalVehicles(vehicleRepository.countByCustomerGarageId(garageId));
        r.setTotalServices(garageServiceRepository.countByGarageId(garageId));
        r.setPendingJobs(jobCardRepository.countByGarageIdAndStatus(garageId, JobStatus.PENDING)
                + jobCardRepository.countByGarageIdAndStatus(garageId, JobStatus.CREATED));
        r.setInProgressJobs(jobCardRepository.countByGarageIdAndStatus(garageId, JobStatus.IN_PROGRESS));
        r.setCompletedJobs(jobCardRepository.countByGarageIdAndStatus(garageId, JobStatus.COMPLETED));
        r.setTotalInvoices(invoiceRepository.countByGarageId(garageId));
        r.setTotalRevenue(invoiceRepository.sumGrandTotalByGarageId(garageId));
        r.setPendingPayments(invoiceRepository.sumRemainingBalanceByGarageId(garageId));
        r.setTodayAppointments(appointmentRepository.countByGarageIdAndAppointmentDate(garageId, LocalDate.now()));

        // Monthly revenue
        List<Map<String, Object>> monthlyRevenue = invoiceRepository.findByGarageId(garageId).stream()
                .filter(inv -> inv.getInvoiceDate() != null)
                .collect(Collectors.groupingBy(inv -> inv.getInvoiceDate().getMonth().name()))
                .entrySet().stream().map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("month", e.getKey());
                    m.put("revenue", e.getValue().stream().map(i -> i.getGrandTotal()).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add));
                    return m;
                }).collect(Collectors.toList());
        r.setMonthlyRevenue(monthlyRevenue);

        // Job status distribution
        List<Map<String, Object>> jobStatusDist = new ArrayList<>();
        for (JobStatus s : JobStatus.values()) {
            Map<String, Object> m = new HashMap<>();
            m.put("status", s.name());
            m.put("count", jobCardRepository.countByGarageIdAndStatus(garageId, s));
            jobStatusDist.add(m);
        }
        r.setJobStatusDistribution(jobStatusDist);

        // Payment status distribution
        List<Map<String, Object>> paymentDist = new ArrayList<>();
        for (InvoiceStatus s : InvoiceStatus.values()) {
            Map<String, Object> m = new HashMap<>();
            m.put("status", s.name());
            m.put("count", invoiceRepository.findByGarageIdAndStatus(garageId, s).size());
            paymentDist.add(m);
        }
        r.setPaymentStatusDistribution(paymentDist);

        // Popular services
        List<Map<String, Object>> popularServices = garageServiceRepository.findByGarageId(garageId).stream()
                .map(s -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("name", s.getName());
                    m.put("count", 0); // would need job card item count
                    return m;
                }).limit(5).collect(Collectors.toList());
        r.setPopularServices(popularServices);

        r.setDailyServiceOrders(new ArrayList<>());
        return r;
    }
}

