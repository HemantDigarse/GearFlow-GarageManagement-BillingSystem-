package com.gearflow.repository;

import com.gearflow.entity.GarageService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GarageServiceRepository extends JpaRepository<GarageService, Long> {
    List<GarageService> findByGarageId(Long garageId);
    List<GarageService> findByGarageIdAndActiveTrue(Long garageId);
    long countByGarageId(Long garageId);
}

