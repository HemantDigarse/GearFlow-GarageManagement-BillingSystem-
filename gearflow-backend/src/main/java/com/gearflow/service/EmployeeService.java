package com.gearflow.service;

import com.gearflow.dto.request.EmployeeRequest;
import com.gearflow.dto.response.EmployeeResponse;
import com.gearflow.entity.Employee;
import com.gearflow.entity.Garage;
import com.gearflow.enums.EmploymentStatus;
import com.gearflow.enums.JobStatus;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.EmployeeRepository;
import com.gearflow.repository.JobCardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final JobCardRepository jobCardRepository;
    private final AuthService authService;

    public EmployeeService(EmployeeRepository employeeRepository, JobCardRepository jobCardRepository, AuthService authService) {
        this.employeeRepository = employeeRepository;
        this.jobCardRepository = jobCardRepository;
        this.authService = authService;
    }

    public List<EmployeeResponse> getAllEmployees() {
        Garage garage = authService.getGarageForCurrentUser();
        return employeeRepository.findByGarageId(garage.getId()).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = findByIdAndGarage(id);
        return toResponse(employee);
    }

    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        Garage garage = authService.getGarageForCurrentUser();
        Employee employee = new Employee();
        employee.setGarage(garage);
        employee.setName(request.getName());
        employee.setMobile(request.getMobile());
        employee.setEmail(request.getEmail());
        employee.setDesignation(request.getDesignation());
        employee.setSalary(request.getSalary());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setStatus(EmploymentStatus.ACTIVE);
        employeeRepository.save(employee);
        return toResponse(employee);
    }

    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = findByIdAndGarage(id);
        employee.setName(request.getName());
        employee.setMobile(request.getMobile());
        employee.setEmail(request.getEmail());
        employee.setDesignation(request.getDesignation());
        employee.setSalary(request.getSalary());
        employee.setJoiningDate(request.getJoiningDate());
        employeeRepository.save(employee);
        return toResponse(employee);
    }

    @Transactional
    public void toggleEmployeeStatus(Long id) {
        Employee employee = findByIdAndGarage(id);
        employee.setStatus(employee.getStatus() == EmploymentStatus.ACTIVE ? EmploymentStatus.INACTIVE : EmploymentStatus.ACTIVE);
        employeeRepository.save(employee);
    }

    private Employee findByIdAndGarage(Long id) {
        Garage garage = authService.getGarageForCurrentUser();
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        if (!employee.getGarage().getId().equals(garage.getId())) {
            throw new ResourceNotFoundException("Employee not found");
        }
        return employee;
    }

    private EmployeeResponse toResponse(Employee e) {
        EmployeeResponse r = new EmployeeResponse();
        r.setId(e.getId());
        r.setName(e.getName());
        r.setMobile(e.getMobile());
        r.setEmail(e.getEmail());
        r.setDesignation(e.getDesignation());
        r.setSalary(e.getSalary());
        r.setJoiningDate(e.getJoiningDate());
        r.setStatus(e.getStatus().name());
        r.setAssignedJobs(jobCardRepository.findByAssignedEmployeeId(e.getId()).size());
        r.setCompletedJobs(jobCardRepository.countByAssignedEmployeeIdAndStatus(e.getId(), JobStatus.COMPLETED));
        return r;
    }
}

