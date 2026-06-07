package com.neurofleetx.backend.repository;

import com.neurofleetx.backend.model.AgentAvailability;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AgentAvailabilityRepository extends JpaRepository<AgentAvailability, Long> {
    List<AgentAvailability> findByAgent_Id(Long agentId);

    List<AgentAvailability> findByStatus(String status);
}
