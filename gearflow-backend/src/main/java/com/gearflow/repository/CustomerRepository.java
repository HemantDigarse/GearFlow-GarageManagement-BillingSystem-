package com.gearflow.repository;

import com.gearflow.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByGarageId(Long garageId);
    long countByGarageId(Long garageId);
    List<Customer> findByGarageIdAndNameContainingIgnoreCase(Long garageId, String name);
}

