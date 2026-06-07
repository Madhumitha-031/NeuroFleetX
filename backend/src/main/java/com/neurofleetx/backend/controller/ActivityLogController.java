package com.neurofleetx.backend.controller;

import com.neurofleetx.backend.model.ActivityLog;
import com.neurofleetx.backend.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "http://localhost:3000")
public class ActivityLogController {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @GetMapping("/recent")
    public List<ActivityLog> getRecentLogs() {
        return activityLogRepository.findTop10ByOrderByTimestampDesc();
    }
}
