package com.gearflow.service;

import com.gearflow.dto.request.VehicleRequest;
import com.gearflow.dto.response.VehicleResponse;
import com.gearflow.entity.*;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.CustomerRepository;
import com.gearflow.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;
    private final AuthService authService;

    public VehicleService(VehicleRepository vehicleRepository, CustomerRepository customerRepository, AuthService authService) {
        this.vehicleRepository = vehicleRepository;
        this.customerRepository = customerRepository;
        this.authService = authService;
    }

    public List<VehicleResponse> getAllVehicles() {
        Garage garage = authService.getGarageForCurrentUser();
        return vehicleRepository.findByCustomerGarageId(garage.getId()).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public VehicleResponse getVehicleById(Long id) {
        Vehicle vehicle = findByIdAndGarage(id);
        return toResponse(vehicle);
    }

    public List<VehicleResponse> getVehiclesByCustomer(Long customerId) {
        Garage garage = authService.getGarageForCurrentUser();
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        if (!customer.getGarage().getId().equals(garage.getId())) {
            throw new ResourceNotFoundException("Customer not found");
        }
        return vehicleRepository.findByCustomerId(customerId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public VehicleResponse createVehicle(VehicleRequest request) {
        Garage garage = authService.getGarageForCurrentUser();
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        if (!customer.getGarage().getId().equals(garage.getId())) {
            throw new ResourceNotFoundException("Customer not found");
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setCustomer(customer);
        vehicle.setRegistrationNumber(request.getRegistrationNumber());
        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setManufacturingYear(request.getManufacturingYear());
        vehicle.setFuelType(request.getFuelType());
        vehicleRepository.save(vehicle);
        return toResponse(vehicle);
    }

    @Transactional
    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        Vehicle vehicle = findByIdAndGarage(id);
        vehicle.setRegistrationNumber(request.getRegistrationNumber());
        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setManufacturingYear(request.getManufacturingYear());
        vehicle.setFuelType(request.getFuelType());
        vehicleRepository.save(vehicle);
        return toResponse(vehicle);
    }

    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = findByIdAndGarage(id);
        vehicleRepository.delete(vehicle);
    }

    private Vehicle findByIdAndGarage(Long id) {
        Garage garage = authService.getGarageForCurrentUser();
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        if (!vehicle.getCustomer().getGarage().getId().equals(garage.getId())) {
            throw new ResourceNotFoundException("Vehicle not found");
        }
        return vehicle;
    }

    private VehicleResponse toResponse(Vehicle v) {
        VehicleResponse r = new VehicleResponse();
        r.setId(v.getId());
        r.setCustomerId(v.getCustomer().getId());
        r.setCustomerName(v.getCustomer().getName());
        r.setRegistrationNumber(v.getRegistrationNumber());
        r.setBrand(v.getBrand());
        r.setModel(v.getModel());
        r.setVehicleType(v.getVehicleType());
        r.setManufacturingYear(v.getManufacturingYear());
        r.setFuelType(v.getFuelType());
        r.setLastServiceDate(v.getLastServiceDate());
        return r;
    }
}

