package com.gearflow.repository;

import com.gearflow.entity.JobCard;
import com.gearflow.enums.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobCardRepository extends JpaRepository<JobCard, Long> {
    List<JobCard> findByGarageId(Long garageId);
    List<JobCard> findByGarageIdAndStatus(Long garageId, JobStatus status);
    long countByGarageIdAndStatus(Long garageId, JobStatus status);
    long countByGarageId(Long garageId);
    Optional<JobCard> findByJobCardNumber(String jobCardNumber);
    List<JobCard> findByVehicleId(Long vehicleId);
    List<JobCard> findByAssignedEmployeeId(Long employeeId);
    long countByAssignedEmployeeIdAndStatus(Long employeeId, JobStatus status);
}

