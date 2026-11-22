package com.gearflow.service;

import com.gearflow.dto.request.GarageRequest;
import com.gearflow.dto.response.*;
import com.gearflow.entity.Garage;
import com.gearflow.entity.User;
import com.gearflow.enums.GarageStatus;
import com.gearflow.enums.Role;
import com.gearflow.exception.BadRequestException;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final GarageRepository garageRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final EmployeeRepository employeeRepository;
    private final JobCardRepository jobCardRepository;

    public AdminService(GarageRepository garageRepository, UserRepository userRepository,
                        CustomerRepository customerRepository, InvoiceRepository invoiceRepository,
                        EmployeeRepository employeeRepository, JobCardRepository jobCardRepository) {
        this.garageRepository = garageRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.invoiceRepository = invoiceRepository;
        this.employeeRepository = employeeRepository;
        this.jobCardRepository = jobCardRepository;
    }

    public AdminDashboardResponse getDashboard() {
        AdminDashboardResponse response = new AdminDashboardResponse();
        response.setTotalGarages(garageRepository.count());
        response.setActiveGarages(garageRepository.countByStatus(GarageStatus.ACTIVE));
        response.setInactiveGarages(garageRepository.countByStatus(GarageStatus.INACTIVE));
        response.setPendingGarages(garageRepository.countByStatus(GarageStatus.PENDING));
        response.setTotalOwners(userRepository.countByRole(Role.GARAGE_OWNER));
        response.setTotalCustomers(customerRepository.count());
        response.setTotalRevenue(invoiceRepository.sumAllGrandTotal());

        // Garage status distribution
        List<Map<String, Object>> statusDist = new ArrayList<>();
        for (GarageStatus s : GarageStatus.values()) {
            Map<String, Object> item = new HashMap<>();
            item.put("status", s.name());
            item.put("count", garageRepository.countByStatus(s));
            statusDist.add(item);
        }
        response.setGarageStatusDistribution(statusDist);

        // Recent garages
        List<Garage> allGarages = garageRepository.findAll();
        allGarages.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        List<Map<String, Object>> recentGarages = allGarages.stream().limit(5).map(g -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", g.getId());
            map.put("name", g.getName());
            map.put("ownerName", g.getOwner().getFullName());
            map.put("status", g.getStatus().name());
            map.put("city", g.getCity());
            map.put("registrationDate", g.getRegistrationDate() != null ? g.getRegistrationDate().toString() : "");
            return map;
        }).collect(Collectors.toList());
        response.setRecentGarages(recentGarages);

        // Monthly registrations
        Map<String, Long> monthlyMap = allGarages.stream()
                .filter(g -> g.getRegistrationDate() != null)
                .collect(Collectors.groupingBy(
                        g -> g.getRegistrationDate().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                        Collectors.counting()));
        List<Map<String, Object>> monthlyRegs = monthlyMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("month", e.getKey());
                    m.put("count", e.getValue());
                    return m;
                }).collect(Collectors.toList());
        response.setMonthlyRegistrations(monthlyRegs);

        return response;
    }

    public List<GarageResponse> getAllGarages(String search, String status) {
        List<Garage> garages;
        boolean hasSearch = search != null && !search.isBlank();
        boolean hasStatus = status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status);
        GarageStatus garageStatus = hasStatus ? parseGarageStatus(status) : null;
        if (hasSearch && hasStatus) {
            garages = garageRepository.findByNameContainingIgnoreCaseAndStatus(search, garageStatus);
        } else if (hasSearch) {
            garages = garageRepository.findByNameContainingIgnoreCase(search);
        } else if (hasStatus) {
            garages = garageRepository.findByStatus(garageStatus);
        } else {
            garages = garageRepository.findAll();
        }
        return garages.stream().map(this::toGarageResponse).collect(Collectors.toList());
    }

    private GarageStatus parseGarageStatus(String status) {
        try {
            return GarageStatus.valueOf(status.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid garage status: " + status);
        }
    }

    public GarageResponse getGarageById(Long id) {
        Garage garage = garageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Garage not found"));
        return toGarageResponse(garage);
    }

    @Transactional
    public GarageResponse createGarage(GarageRequest request) {
        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        Garage garage = new Garage();
        garage.setName(request.getName());
        garage.setOwner(owner);
        garage.setEmail(request.getEmail());
        garage.setPhone(request.getPhone());
        garage.setAddress(request.getAddress());
        garage.setCity(request.getCity());
        garage.setState(request.getState());
        garage.setLogoUrl(request.getLogoUrl());
        garage.setStatus(GarageStatus.ACTIVE);
        garageRepository.save(garage);
        return toGarageResponse(garage);
    }

    @Transactional
    public GarageResponse updateGarage(Long id, GarageRequest request) {
        Garage garage = garageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Garage not found"));
        if (request.getName() != null) garage.setName(request.getName());
        if (request.getEmail() != null) garage.setEmail(request.getEmail());
        if (request.getPhone() != null) garage.setPhone(request.getPhone());
        if (request.getAddress() != null) garage.setAddress(request.getAddress());
        if (request.getCity() != null) garage.setCity(request.getCity());
        if (request.getState() != null) garage.setState(request.getState());
        if (request.getLogoUrl() != null) garage.setLogoUrl(request.getLogoUrl());
        garageRepository.save(garage);
        return toGarageResponse(garage);
    }

    @Transactional
    public void updateGarageStatus(Long id, String status) {
        Garage garage = garageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Garage not found"));
        try {
            garage.setStatus(GarageStatus.valueOf(status));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status);
        }
        garageRepository.save(garage);
    }

    public List<UserResponse> getAllOwners() {
        return userRepository.findByRole(Role.GARAGE_OWNER).stream().map(this::toUserResponse).collect(Collectors.toList());
    }

    public UserResponse getOwnerById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));
        return toUserResponse(user);
    }

    @Transactional
    public void updateOwnerStatus(Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));
        user.setActive(active);
        userRepository.save(user);
    }

    public Map<String, Object> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        List<Garage> allGarages = garageRepository.findAll();

        // Garage-wise revenue
        List<Map<String, Object>> garageRevenue = allGarages.stream().map(g -> {
            Map<String, Object> m = new HashMap<>();
            m.put("garageName", g.getName());
            m.put("revenue", invoiceRepository.sumGrandTotalByGarageId(g.getId()));
            m.put("customers", customerRepository.countByGarageId(g.getId()));
            m.put("employees", employeeRepository.countByGarageId(g.getId()));
            return m;
        }).collect(Collectors.toList());
        analytics.put("garageRevenue", garageRevenue);
        analytics.put("totalRevenue", invoiceRepository.sumAllGrandTotal());
        analytics.put("totalGarages", garageRepository.count());
        analytics.put("totalCustomers", customerRepository.count());

        return analytics;
    }

    private GarageResponse toGarageResponse(Garage garage) {
        GarageResponse r = new GarageResponse();
        r.setId(garage.getId());
        r.setName(garage.getName());
        r.setOwnerName(garage.getOwner().getFullName());
        r.setOwnerId(garage.getOwner().getId());
        r.setOwnerEmail(garage.getOwner().getEmail());
        r.setEmail(garage.getEmail());
        r.setPhone(garage.getPhone());
        r.setAddress(garage.getAddress());
        r.setCity(garage.getCity());
        r.setState(garage.getState());
        r.setLogoUrl(garage.getLogoUrl());
        r.setStatus(garage.getStatus().name());
        r.setRegistrationDate(garage.getRegistrationDate());
        r.setTotalCustomers(customerRepository.countByGarageId(garage.getId()));
        r.setTotalEmployees(employeeRepository.countByGarageId(garage.getId()));
        r.setTotalJobCards(jobCardRepository.countByGarageId(garage.getId()));
        return r;
    }

    private UserResponse toUserResponse(User user) {
        UserResponse r = new UserResponse();
        r.setId(user.getId());
        r.setUsername(user.getUsername());
        r.setEmail(user.getEmail());
        r.setFullName(user.getFullName());
        r.setPhone(user.getPhone());
        r.setRole(user.getRole().name());
        r.setActive(user.isActive());
        garageRepository.findByOwnerId(user.getId()).ifPresent(g -> {
            r.setGarageName(g.getName());
            r.setGarageId(g.getId());
        });
        return r;
    }
}

