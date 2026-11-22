package com.gearflow.repository;

import com.gearflow.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByCustomerId(Long customerId);
    List<Vehicle> findByCustomerGarageId(Long garageId);
    long countByCustomerGarageId(Long garageId);
    List<Vehicle> findByRegistrationNumberContainingIgnoreCase(String registrationNumber);
    List<Vehicle> findByCustomerGarageIdAndRegistrationNumberContainingIgnoreCase(Long garageId, String registrationNumber);
}

