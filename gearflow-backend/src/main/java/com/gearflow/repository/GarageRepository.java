package com.gearflow.repository;

import com.gearflow.entity.Garage;
import com.gearflow.enums.GarageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GarageRepository extends JpaRepository<Garage, Long> {
    Optional<Garage> findByOwnerId(Long ownerId);
    List<Garage> findByStatus(GarageStatus status);
    List<Garage> findByNameContainingIgnoreCase(String name);
    List<Garage> findByNameContainingIgnoreCaseAndStatus(String name, GarageStatus status);
    long countByStatus(GarageStatus status);
}

