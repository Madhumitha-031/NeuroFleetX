package com.neurofleetx.backend.repository;

import com.neurofleetx.backend.model.Vehicle;
import com.neurofleetx.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByVin(String vin);

    Optional<Vehicle> findByDriver(User driver);
}
