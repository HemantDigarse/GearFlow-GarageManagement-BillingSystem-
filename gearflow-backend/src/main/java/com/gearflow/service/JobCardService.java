package com.gearflow.service;

import com.gearflow.dto.request.JobCardRequest;
import com.gearflow.dto.response.JobCardResponse;
import com.gearflow.entity.*;
import com.gearflow.enums.JobPriority;
import com.gearflow.enums.JobStatus;
import com.gearflow.exception.BadRequestException;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.*;
import com.gearflow.util.InvoiceNumberGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobCardService {

    private final JobCardRepository jobCardRepository;
    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final GarageServiceRepository garageServiceRepository;
    private final EmployeeRepository employeeRepository;
    private final AuthService authService;

    public JobCardService(JobCardRepository jobCardRepository, CustomerRepository customerRepository,
                          VehicleRepository vehicleRepository, GarageServiceRepository garageServiceRepository,
                          EmployeeRepository employeeRepository, AuthService authService) {
        this.jobCardRepository = jobCardRepository;
        this.customerRepository = customerRepository;
        this.vehicleRepository = vehicleRepository;
        this.garageServiceRepository = garageServiceRepository;
        this.employeeRepository = employeeRepository;
        this.authService = authService;
    }

    public List<JobCardResponse> getAllJobCards(String status) {
        Garage garage = authService.getGarageForCurrentUser();
        List<JobCard> jobCards;
        if (status != null && !status.isEmpty() && !status.equals("ALL")) {
            jobCards = jobCardRepository.findByGarageIdAndStatus(garage.getId(), JobStatus.valueOf(status));
        } else {
            jobCards = jobCardRepository.findByGarageId(garage.getId());
        }
        return jobCards.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public JobCardResponse getJobCardById(Long id) {
        JobCard jobCard = findByIdAndGarage(id);
        return toResponse(jobCard);
    }

    @Transactional
    public JobCardResponse createJobCard(JobCardRequest request) {
        Garage garage = authService.getGarageForCurrentUser();

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        if (!customer.getGarage().getId().equals(garage.getId())) {
            throw new ResourceNotFoundException("Customer not found in your garage");
        }

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        if (!vehicle.getCustomer().getId().equals(customer.getId())) {
            throw new BadRequestException("Vehicle does not belong to selected customer");
        }

        JobCard jobCard = new JobCard();
        jobCard.setGarage(garage);
        jobCard.setCustomer(customer);
        jobCard.setVehicle(vehicle);
        jobCard.setJobCardNumber(InvoiceNumberGenerator.generateJobCardNumber());
        jobCard.setProblemDescription(request.getProblemDescription());
        jobCard.setEstimatedCompletionDate(request.getEstimatedCompletionDate());
        jobCard.setNotes(request.getNotes());
        jobCard.setStatus(JobStatus.CREATED);

        if (request.getPriority() != null) {
            jobCard.setPriority(JobPriority.valueOf(request.getPriority()));
        }

        if (request.getAssignedEmployeeId() != null) {
            Employee employee = employeeRepository.findById(request.getAssignedEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
            jobCard.setAssignedEmployee(employee);
        }

        List<JobCardItem> items = new ArrayList<>();
        if (request.getItems() != null) {
            for (JobCardRequest.JobCardItemRequest itemReq : request.getItems()) {
                GarageService service = garageServiceRepository.findById(itemReq.getServiceId())
                        .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
                JobCardItem item = new JobCardItem();
                item.setJobCard(jobCard);
                item.setService(service);
                item.setQuantity(itemReq.getQuantity() != null ? itemReq.getQuantity() : 1);
                item.setUnitPrice(service.getPrice());
                item.setTotalPrice(service.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                items.add(item);
            }
        }
        jobCard.setItems(items);
        jobCardRepository.save(jobCard);
        return toResponse(jobCard);
    }

    @Transactional
    public JobCardResponse updateJobCard(Long id, JobCardRequest request) {
        JobCard jobCard = findByIdAndGarage(id);
        if (request.getProblemDescription() != null) jobCard.setProblemDescription(request.getProblemDescription());
        if (request.getEstimatedCompletionDate() != null) jobCard.setEstimatedCompletionDate(request.getEstimatedCompletionDate());
        if (request.getNotes() != null) jobCard.setNotes(request.getNotes());
        if (request.getPriority() != null) jobCard.setPriority(JobPriority.valueOf(request.getPriority()));
        if (request.getAssignedEmployeeId() != null) {
            Employee employee = employeeRepository.findById(request.getAssignedEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
            jobCard.setAssignedEmployee(employee);
        }
        jobCardRepository.save(jobCard);
        return toResponse(jobCard);
    }

    @Transactional
    public void updateJobCardStatus(Long id, String status) {
        JobCard jobCard = findByIdAndGarage(id);
        try {
            jobCard.setStatus(JobStatus.valueOf(status));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status);
        }
        jobCardRepository.save(jobCard);
    }

    private JobCard findByIdAndGarage(Long id) {
        Garage garage = authService.getGarageForCurrentUser();
        JobCard jobCard = jobCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job card not found"));
        if (!jobCard.getGarage().getId().equals(garage.getId())) {
            throw new ResourceNotFoundException("Job card not found");
        }
        return jobCard;
    }

    private JobCardResponse toResponse(JobCard jc) {
        JobCardResponse r = new JobCardResponse();
        r.setId(jc.getId());
        r.setJobCardNumber(jc.getJobCardNumber());
        r.setCustomerId(jc.getCustomer().getId());
        r.setCustomerName(jc.getCustomer().getName());
        r.setCustomerMobile(jc.getCustomer().getMobile());
        r.setVehicleId(jc.getVehicle().getId());
        r.setVehicleRegNumber(jc.getVehicle().getRegistrationNumber());
        r.setVehicleBrand(jc.getVehicle().getBrand());
        r.setVehicleModel(jc.getVehicle().getModel());
        if (jc.getAssignedEmployee() != null) {
            r.setAssignedEmployeeId(jc.getAssignedEmployee().getId());
            r.setAssignedEmployeeName(jc.getAssignedEmployee().getName());
        }
        r.setProblemDescription(jc.getProblemDescription());
        r.setEstimatedCompletionDate(jc.getEstimatedCompletionDate());
        r.setPriority(jc.getPriority().name());
        r.setStatus(jc.getStatus().name());
        r.setNotes(jc.getNotes());
        r.setCreatedAt(jc.getCreatedAt());
        r.setUpdatedAt(jc.getUpdatedAt());

        BigDecimal total = BigDecimal.ZERO;
        List<JobCardResponse.JobCardItemResponse> itemResponses = new ArrayList<>();
        if (jc.getItems() != null) {
            for (JobCardItem item : jc.getItems()) {
                JobCardResponse.JobCardItemResponse ir = new JobCardResponse.JobCardItemResponse();
                ir.setId(item.getId());
                ir.setServiceId(item.getService().getId());
                ir.setServiceName(item.getService().getName());
                ir.setQuantity(item.getQuantity());
                ir.setUnitPrice(item.getUnitPrice());
                ir.setTotalPrice(item.getTotalPrice());
                itemResponses.add(ir);
                total = total.add(item.getTotalPrice());
            }
        }
        r.setItems(itemResponses);
        r.setTotalAmount(total);
        return r;
    }
}

