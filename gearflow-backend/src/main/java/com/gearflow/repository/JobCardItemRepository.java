package com.gearflow.repository;

import com.gearflow.entity.JobCardItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobCardItemRepository extends JpaRepository<JobCardItem, Long> {
    List<JobCardItem> findByJobCardId(Long jobCardId);
}

