package com.neurofleetx.backend.controller;

import com.neurofleetx.backend.dto.AgentAvailabilityRequest;
import com.neurofleetx.backend.service.AvailabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/agent")
@CrossOrigin(origins = "http://localhost:3000")
public class AgentController {

    @Autowired
    private AvailabilityService availabilityService;

    @Autowired
    private com.neurofleetx.backend.repository.ActivityLogRepository activityLogRepository;

    @PostMapping("/availability")
    public ResponseEntity<?> setAvailability(@RequestBody AgentAvailabilityRequest request) {
        System.out.println("DEBUG: setAvailability request: email=" + request.getEmail() + ", date=" + request.getDate()
                + ", model=" + request.getVehicleModel());
        try {
            com.neurofleetx.backend.model.AgentAvailability availability = availabilityService.setAvailability(request);
            // Log activity
            activityLogRepository.save(new com.neurofleetx.backend.model.ActivityLog(
                    request.getEmail(), "SET_AVAILABILITY", "Set availability for: " + request.getDate(),
                    java.time.LocalDateTime.now()));
            return ResponseEntity.ok(availability);
        } catch (Exception e) {
            System.err.println("ERROR in setAvailability:");
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/availability")
    public ResponseEntity<?> getAgentAvailability(@RequestParam String email) {
        try {
            return ResponseEntity.ok(availabilityService.getAgentSlots(email));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/available-slots")
    public ResponseEntity<?> getAvailableSlots() {
        return ResponseEntity.ok(availabilityService.getAvailableSlots());
    }

    @PostMapping("/book/{slotId}")
    public ResponseEntity<?> bookAppointment(@PathVariable Long slotId,
            @RequestBody com.neurofleetx.backend.dto.BookingRequest request) {
        System.out.println("CONTROLLER: Booking request for slot " + slotId + " from " + request.getEmail());
        try {
            ResponseEntity<?> response = ResponseEntity
                    .ok(availabilityService.bookAppointment(slotId, request.getEmail(), request.getReason(),
                            request.getDestinationLat(), request.getDestinationLng()));
            // Log activity
            activityLogRepository.save(new com.neurofleetx.backend.model.ActivityLog(
                    request.getEmail(), "BOOK_APPT", "Booked appointment for slot ID: " + slotId + " at ["
                            + request.getDestinationLat() + "," + request.getDestinationLng() + "]",
                    java.time.LocalDateTime.now()));
            return response;
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/appointments/agent")
    public ResponseEntity<?> getAgentAppointments(@RequestParam String email) {
        System.out.println("CONTROLLER: Fetching appointments for agent: " + email);
        return ResponseEntity.ok(availabilityService.getAgentAppointments(email));
    }

    @GetMapping("/appointments/client")
    public ResponseEntity<?> getClientAppointments(@RequestParam String email) {
        return ResponseEntity.ok(availabilityService.getClientAppointments(email));
    }

    @PostMapping("/appointments/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(@PathVariable Long id, @RequestParam String status,
            @RequestParam String agentEmail) {
        try {
            com.neurofleetx.backend.model.Appointment appt = availabilityService.updateAppointmentStatus(id, status,
                    agentEmail);
            // Log activity
            activityLogRepository.save(new com.neurofleetx.backend.model.ActivityLog(
                    agentEmail, "UPDATE_APPT_STATUS", "Set appointment " + id + " to: " + status,
                    java.time.LocalDateTime.now()));
            return ResponseEntity.ok(appt);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
