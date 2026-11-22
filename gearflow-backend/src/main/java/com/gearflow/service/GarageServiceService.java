package com.gearflow.service;

import com.gearflow.dto.request.ServiceRequest;
import com.gearflow.dto.response.ServiceResponse;
import com.gearflow.entity.Garage;
import com.gearflow.entity.GarageService;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.GarageServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GarageServiceService {

    private final GarageServiceRepository garageServiceRepository;
    private final AuthService authService;

    public GarageServiceService(GarageServiceRepository garageServiceRepository, AuthService authService) {
        this.garageServiceRepository = garageServiceRepository;
        this.authService = authService;
    }

    public List<ServiceResponse> getAllServices() {
        Garage garage = authService.getGarageForCurrentUser();
        return garageServiceRepository.findByGarageId(garage.getId()).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<ServiceResponse> getActiveServices() {
        Garage garage = authService.getGarageForCurrentUser();
        return garageServiceRepository.findByGarageIdAndActiveTrue(garage.getId()).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ServiceResponse createService(ServiceRequest request) {
        Garage garage = authService.getGarageForCurrentUser();
        GarageService service = new GarageService();
        service.setGarage(garage);
        service.setName(request.getName());
        service.setDescription(request.getDescription());
        service.setPrice(request.getPrice());
        service.setActive(true);
        garageServiceRepository.save(service);
        return toResponse(service);
    }

    @Transactional
    public ServiceResponse updateService(Long id, ServiceRequest request) {
        GarageService service = findByIdAndGarage(id);
        service.setName(request.getName());
        service.setDescription(request.getDescription());
        service.setPrice(request.getPrice());
        garageServiceRepository.save(service);
        return toResponse(service);
    }

    @Transactional
    public void toggleServiceStatus(Long id) {
        GarageService service = findByIdAndGarage(id);
        service.setActive(!service.isActive());
        garageServiceRepository.save(service);
    }

    private GarageService findByIdAndGarage(Long id) {
        Garage garage = authService.getGarageForCurrentUser();
        GarageService service = garageServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        if (!service.getGarage().getId().equals(garage.getId())) {
            throw new ResourceNotFoundException("Service not found");
        }
        return service;
    }

    private ServiceResponse toResponse(GarageService s) {
        ServiceResponse r = new ServiceResponse();
        r.setId(s.getId());
        r.setName(s.getName());
        r.setDescription(s.getDescription());
        r.setPrice(s.getPrice());
        r.setActive(s.isActive());
        return r;
    }
}

