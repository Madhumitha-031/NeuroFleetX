package com.neurofleetx.backend.service;

import com.neurofleetx.backend.model.Vehicle;
import com.neurofleetx.backend.repository.VehicleRepository;
import com.neurofleetx.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    private final Random random = new Random();

    public List<Vehicle> getAllVehicles() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        // SimulateTelemetry on every fetch for now to keep it dynamic
        vehicles.forEach(this::simulateTelemetry);
        return vehicles;
    }

    public Vehicle getVehicleByDriverEmail(String email) {
        return userRepository.findByEmail(email)
                .flatMap(vehicleRepository::findByDriver)
                .map(v -> {
                    simulateTelemetry(v);
                    return v;
                })
                .orElse(null);
    }

    public Vehicle createVehicle(String vin, String model, String type, String driverEmail) {
        Vehicle vehicle = new Vehicle();
        vehicle.setVin(vin);
        vehicle.setModel(model);
        vehicle.setType(type);
        vehicle.setStatus("IDLE");
        vehicle.setBatteryLevel(100.0);
        vehicle.setFuelLevel(100.0);
        vehicle.setSpeed(0.0);

        // Default Location (e.g., center of a city)
        vehicle.setLatitude(12.9716);
        vehicle.setLongitude(77.5946);

        if (driverEmail != null && !driverEmail.isEmpty()) {
            userRepository.findByEmail(driverEmail).ifPresent(vehicle::setDriver);
        }

        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateLocation(String email, Double lat, Double lng) {
        return userRepository.findByEmail(email)
                .flatMap(vehicleRepository::findByDriver)
                .map(v -> {
                    v.setLatitude(lat);
                    v.setLongitude(lng);
                    v.setLastUpdate(LocalDateTime.now());
                    return vehicleRepository.save(v);
                })
                .orElse(null);
    }

    public Vehicle updateVehicle(Long id, String status) {
        if (id == null)
            return null;
        return vehicleRepository.findById(id).map(v -> {
            v.setStatus(status);
            v.setLastUpdate(LocalDateTime.now());
            return vehicleRepository.save(v);
        }).orElse(null);
    }

    private void simulateTelemetry(Vehicle v) {
        if ("MAINTENANCE".equals(v.getStatus())) {
            v.setSpeed(0.0);
            return;
        }

        // Slight movement simulation (delta between -0.005 and 0.005)
        double lat = v.getLatitude() != null ? v.getLatitude() : 12.9716;
        double lng = v.getLongitude() != null ? v.getLongitude() : 77.5946;

        double latDelta = (random.nextDouble() - 0.5) * 0.01;
        double lngDelta = (random.nextDouble() - 0.5) * 0.01;

        v.setLatitude(lat + latDelta);
        v.setLongitude(lng + lngDelta);

        // Battery/Fuel Drain if moving
        double battery = v.getBatteryLevel() != null ? v.getBatteryLevel() : 100.0;
        double fuel = v.getFuelLevel() != null ? v.getFuelLevel() : 100.0;

        if ("IN_USE".equals(v.getStatus())) {
            v.setSpeed(40.0 + random.nextDouble() * 40.0);
            v.setBatteryLevel(Math.max(0, battery - random.nextDouble() * 0.5));
            v.setFuelLevel(Math.max(0, fuel - random.nextDouble() * 0.3));
        } else {
            v.setSpeed(0.0);
        }

        v.setLastUpdate(LocalDateTime.now());
    }

    public void seedFleet() {
        if (vehicleRepository.count() > 0) {
            // Ensure driver1 has a vehicle for tracking demo
            if (getVehicleByDriverEmail("driver1@neurofleetx.com") == null) {
                vehicleRepository.findAll().stream()
                        .filter(v -> v.getDriver() == null)
                        .findFirst()
                        .ifPresent(v -> {
                            userRepository.findByEmail("driver1@neurofleetx.com").ifPresent(u -> {
                                v.setDriver(u);
                                vehicleRepository.save(v);
                                System.out
                                        .println(">>> Assigned vehicle " + v.getVin() + " to driver1@neurofleetx.com");
                            });
                        });
            }
            return;
        }

        String[] models = { "CyberTruck v2", "Volt Nexus", "HeavyHauler X", "EcoSwift", "Titan Rig" };
        String[] types = { "Electric", "Sedan", "Heavy Duty", "Economy", "Heavy Duty" };

        for (int i = 0; i < 5; i++) {
            String driverMail = (i == 0) ? "driver1@neurofleetx.com" : null;
            createVehicle("VIN-SEED-" + i, models[i], types[i], driverMail);
        }
        System.out.println(">>> Vehicle fleet seeded with driver assignments.");
    }

    public void deleteVehicle(Long id) {
        if (id != null) {
            vehicleRepository.deleteById(id);
        }
    }
}
