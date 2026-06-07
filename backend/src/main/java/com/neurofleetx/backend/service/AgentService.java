package com.neurofleetx.backend.service;

import com.neurofleetx.backend.model.AgentAvailability;
import com.neurofleetx.backend.model.User;
import com.neurofleetx.backend.repository.AgentAvailabilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class AgentService {

    @Autowired
    private AgentAvailabilityRepository availabilityRepository;

    public void setAvailability(User agent, LocalDate date, LocalTime startTime, LocalTime endTime) {
        AgentAvailability availability = new AgentAvailability();
        availability.setAgent(agent);
        availability.setDate(date);
        availability.setStartTime(startTime);
        availability.setEndTime(endTime);
        availability.setStatus("AVAILABLE");

        availabilityRepository.save(availability);
    }

    public List<AgentAvailability> getAvailability(User agent) {
        return availabilityRepository.findByAgent_Id(agent.getId());
    }
}
