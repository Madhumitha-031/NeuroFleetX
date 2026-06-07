package com.neurofleetx.backend.controller;

import com.neurofleetx.backend.dto.VehicleRequest;
import com.neurofleetx.backend.model.Vehicle;
import com.neurofleetx.backend.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "http://localhost:5173")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    @GetMapping("/driver/{email}")
    public ResponseEntity<Vehicle> getVehicleByDriver(@PathVariable String email) {
        Vehicle vehicle = vehicleService.getVehicleByDriverEmail(email);
        return vehicle != null ? ResponseEntity.ok(vehicle) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Vehicle> createVehicle(@RequestBody VehicleRequest request) {
        return ResponseEntity.ok(vehicleService.createVehicle(
                request.getVin(),
                request.getModel(),
                request.getType(),
                request.getDriverEmail()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Vehicle> updateStatus(@PathVariable Long id, @RequestParam String status) {
        Vehicle updated = vehicleService.updateVehicle(id, status);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PutMapping("/location")
    public ResponseEntity<Vehicle> updateLocation(@RequestParam String email, @RequestParam Double lat,
            @RequestParam Double lng) {
        Vehicle updated = vehicleService.updateLocation(email, lat, lng);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PostMapping("/seed")
    public ResponseEntity<Void> seedFleet() {
        vehicleService.seedFleet();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/force-assign-driver1")
    public ResponseEntity<String> forceAssign() {
        com.neurofleetx.backend.model.Vehicle v = vehicleService.getVehicleByDriverEmail("driver1@neurofleetx.com");
        if (v != null)
            return ResponseEntity.ok("Already assigned: " + v.getModel());

        vehicleService.seedFleet(); // This tries to assign

        // Double check
        v = vehicleService.getVehicleByDriverEmail("driver1@neurofleetx.com");
        if (v != null)
            return ResponseEntity.ok("Successfully assigned: " + v.getModel());

        return ResponseEntity.badRequest().body("Failed to assign vehicle.");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }
}
