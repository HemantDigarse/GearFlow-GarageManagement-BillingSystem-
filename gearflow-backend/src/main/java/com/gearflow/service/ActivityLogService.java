package com.gearflow.service;

import com.gearflow.entity.ActivityLog;
import com.gearflow.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    public List<ActivityLog> getAllLogs() {
        return activityLogRepository.findAllByOrderByCreatedAtDesc();
    }
}

