package com.neurofleetx.backend.repository;

import com.neurofleetx.backend.model.Appointment;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByClient_Id(Long clientId);

    List<Appointment> findByAgent(com.neurofleetx.backend.model.User agent);
}
