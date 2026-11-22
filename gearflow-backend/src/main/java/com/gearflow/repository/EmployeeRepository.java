package com.gearflow.repository;

import com.gearflow.entity.Employee;
import com.gearflow.enums.EmploymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByGarageId(Long garageId);
    List<Employee> findByGarageIdAndStatus(Long garageId, EmploymentStatus status);
    long countByGarageId(Long garageId);
}

