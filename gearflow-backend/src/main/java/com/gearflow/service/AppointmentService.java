package com.gearflow.service;

import com.gearflow.dto.request.AppointmentRequest;
import com.gearflow.dto.response.AppointmentResponse;
import com.gearflow.entity.*;
import com.gearflow.enums.AppointmentStatus;
import com.gearflow.exception.BadRequestException;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.AppointmentRepository;
import com.gearflow.repository.CustomerRepository;
import com.gearflow.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final AuthService authService;

    public AppointmentService(AppointmentRepository appointmentRepository, CustomerRepository customerRepository,
                              VehicleRepository vehicleRepository, AuthService authService) {
        this.appointmentRepository = appointmentRepository;
        this.customerRepository = customerRepository;
        this.vehicleRepository = vehicleRepository;
        this.authService = authService;
    }

    public List<AppointmentResponse> getAllAppointments() {
        Garage garage = authService.getGarageForCurrentUser();
        return appointmentRepository.findByGarageId(garage.getId()).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<AppointmentResponse> getTodayAppointments() {
        Garage garage = authService.getGarageForCurrentUser();
        return appointmentRepository.findByGarageIdAndAppointmentDate(garage.getId(), LocalDate.now()).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        Garage garage = authService.getGarageForCurrentUser();

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        if (!customer.getGarage().getId().equals(garage.getId())) {
            throw new ResourceNotFoundException("Customer not found");
        }

        Appointment appointment = new Appointment();
        appointment.setGarage(garage);
        appointment.setCustomer(customer);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setServiceDescription(request.getServiceDescription());
        appointment.setNotes(request.getNotes());
        appointment.setStatus(AppointmentStatus.SCHEDULED);

        if (request.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
            if (!vehicle.getCustomer().getGarage().getId().equals(garage.getId())
                    || !vehicle.getCustomer().getId().equals(customer.getId())) {
                throw new ResourceNotFoundException("Vehicle not found for this customer");
            }
            appointment.setVehicle(vehicle);
        }

        appointmentRepository.save(appointment);
        return toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse updateAppointment(Long id, AppointmentRequest request) {
        Appointment appointment = findByIdAndGarage(id);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setServiceDescription(request.getServiceDescription());
        appointment.setNotes(request.getNotes());
        appointmentRepository.save(appointment);
        return toResponse(appointment);
    }

    @Transactional
    public void updateAppointmentStatus(Long id, String status) {
        Appointment appointment = findByIdAndGarage(id);
        try {
            if (status == null || status.isBlank()) {
                throw new IllegalArgumentException("Status is required");
            }
            appointment.setStatus(AppointmentStatus.valueOf(status));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status);
        }
        appointmentRepository.save(appointment);
    }

    private Appointment findByIdAndGarage(Long id) {
        Garage garage = authService.getGarageForCurrentUser();
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        if (!appointment.getGarage().getId().equals(garage.getId())) {
            throw new ResourceNotFoundException("Appointment not found");
        }
        return appointment;
    }

    private AppointmentResponse toResponse(Appointment a) {
        AppointmentResponse r = new AppointmentResponse();
        r.setId(a.getId());
        r.setCustomerId(a.getCustomer().getId());
        r.setCustomerName(a.getCustomer().getName());
        r.setCustomerMobile(a.getCustomer().getMobile());
        if (a.getVehicle() != null) {
            r.setVehicleId(a.getVehicle().getId());
            r.setVehicleRegNumber(a.getVehicle().getRegistrationNumber());
        }
        r.setAppointmentDate(a.getAppointmentDate());
        r.setAppointmentTime(a.getAppointmentTime());
        r.setServiceDescription(a.getServiceDescription());
        r.setStatus(a.getStatus().name());
        r.setNotes(a.getNotes());
        return r;
    }
}

