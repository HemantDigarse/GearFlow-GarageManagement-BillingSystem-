package com.gearflow.repository;

import com.gearflow.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findAllByOrderByCreatedAtDesc();
    List<ActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId);
}

