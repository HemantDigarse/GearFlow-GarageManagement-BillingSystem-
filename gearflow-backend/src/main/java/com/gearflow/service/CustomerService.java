package com.gearflow.service;

import com.gearflow.dto.request.CustomerRequest;
import com.gearflow.dto.response.CustomerResponse;
import com.gearflow.entity.Customer;
import com.gearflow.entity.Garage;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.CustomerRepository;
import com.gearflow.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final AuthService authService;

    public CustomerService(CustomerRepository customerRepository, VehicleRepository vehicleRepository, AuthService authService) {
        this.customerRepository = customerRepository;
        this.vehicleRepository = vehicleRepository;
        this.authService = authService;
    }

    public List<CustomerResponse> getAllCustomers() {
        Garage garage = authService.getGarageForCurrentUser();
        return customerRepository.findByGarageId(garage.getId()).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public CustomerResponse getCustomerById(Long id) {
        Customer customer = findByIdAndGarage(id);
        return toResponse(customer);
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        Garage garage = authService.getGarageForCurrentUser();
        Customer customer = new Customer();
        customer.setGarage(garage);
        customer.setName(request.getName());
        customer.setMobile(request.getMobile());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        customer.setRegistrationDate(LocalDate.now());
        customerRepository.save(customer);
        return toResponse(customer);
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = findByIdAndGarage(id);
        customer.setName(request.getName());
        customer.setMobile(request.getMobile());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        customerRepository.save(customer);
        return toResponse(customer);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = findByIdAndGarage(id);
        customerRepository.delete(customer);
    }

    public List<CustomerResponse> searchCustomers(String query) {
        Garage garage = authService.getGarageForCurrentUser();
        return customerRepository.findByGarageIdAndNameContainingIgnoreCase(garage.getId(), query)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private Customer findByIdAndGarage(Long id) {
        Garage garage = authService.getGarageForCurrentUser();
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        if (!customer.getGarage().getId().equals(garage.getId())) {
            throw new ResourceNotFoundException("Customer not found");
        }
        return customer;
    }

    private CustomerResponse toResponse(Customer customer) {
        CustomerResponse r = new CustomerResponse();
        r.setId(customer.getId());
        r.setName(customer.getName());
        r.setMobile(customer.getMobile());
        r.setEmail(customer.getEmail());
        r.setAddress(customer.getAddress());
        r.setRegistrationDate(customer.getRegistrationDate());
        r.setVehicleCount(vehicleRepository.findByCustomerId(customer.getId()).size());
        return r;
    }
}

