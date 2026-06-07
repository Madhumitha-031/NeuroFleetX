package com.neurofleetx.backend.service;

import com.neurofleetx.backend.dto.AgentAvailabilityRequest;
import com.neurofleetx.backend.model.AgentAvailability;
import com.neurofleetx.backend.model.Appointment;
import com.neurofleetx.backend.model.User;
import com.neurofleetx.backend.repository.AgentAvailabilityRepository;
import com.neurofleetx.backend.repository.AppointmentRepository;
import com.neurofleetx.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AvailabilityService {

        @Autowired
        private AgentAvailabilityRepository availabilityRepository;

        @Autowired
        private AppointmentRepository appointmentRepository;

        @Autowired
        private UserRepository userRepository;

        public AgentAvailability setAvailability(AgentAvailabilityRequest request) {
                User agent = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("Agent not found"));

                AgentAvailability availability = new AgentAvailability();
                availability.setAgent(agent);
                availability.setDate(request.getDate());
                availability.setStartTime(request.getStartTime());
                availability.setEndTime(request.getEndTime());
                availability.setStatus("AVAILABLE");
                availability.setVehicleModel(request.getVehicleModel());
                availability.setVehicleType(request.getVehicleType());

                return availabilityRepository.save(availability);
        }

        public List<AgentAvailability> getAvailableSlots() {
                return availabilityRepository.findByStatus("AVAILABLE");
        }

        public List<AgentAvailability> getAvailability(User agent) {
                return availabilityRepository.findByAgent_Id(agent.getId());
        }

        @Autowired
        private EmailService emailService;

        @Autowired
        private com.neurofleetx.backend.repository.NotificationRepository notificationRepository;

        public Appointment bookAppointment(Long slotId, String clientEmail, String reason, Double destinationLat,
                        Double destinationLng) {
                User client = userRepository.findByEmail(clientEmail)
                                .orElseThrow(() -> new RuntimeException("Client not found"));

                @SuppressWarnings("null")
                AgentAvailability slot = availabilityRepository.findById(slotId)
                                .orElseThrow(() -> new RuntimeException("Slot not found"));

                if (!"AVAILABLE".equals(slot.getStatus())) {
                        throw new RuntimeException("Slot is no longer available");
                }

                System.out.println("BOOKING APPT: Slot=" + slotId + ", Client=" + clientEmail);
                slot.setStatus("BOOKED");
                availabilityRepository.save(slot);

                Appointment appointment = new Appointment();
                appointment.setClient(client);
                appointment.setAvailability(slot);
                appointment.setAgent(slot.getAgent());
                appointment.setStatus("PENDING");
                appointment.setReason(reason);
                appointment.setDestinationLat(destinationLat);
                appointment.setDestinationLng(destinationLng);

                Appointment saved = appointmentRepository.save(appointment);
                System.out.println("APPT SAVED ID: " + saved.getId());

                // Notify Agent (Email) and In-App notifications...
                emailService.sendBookingNotification(slot.getAgent().getEmail(),
                                client.getFullName() != null ? client.getFullName() : client.getEmail(),
                                slot.getDate().toString(),
                                slot.getStartTime().toString());

                notificationRepository.save(new com.neurofleetx.backend.model.Notification(
                                slot.getAgent().getEmail(),
                                "New Appointment Request",
                                "You have a new request from "
                                                + (client.getFullName() != null ? client.getFullName()
                                                                : client.getEmail()),
                                "INFO"));
                notificationRepository.save(new com.neurofleetx.backend.model.Notification(
                                client.getEmail(),
                                "Appointment Requested",
                                "Your request for " + slot.getDate() + " has been sent.",
                                "SUCCESS"));

                return saved;
        }

        public List<AgentAvailability> getAgentSlots(String agentEmail) {
                User agent = userRepository.findByEmail(agentEmail)
                                .orElseThrow(() -> new RuntimeException("Agent not found"));
                return availabilityRepository.findByAgent_Id(agent.getId());
        }

        public List<Appointment> getAgentAppointments(String agentEmail) {
                User agent = userRepository.findByEmail(agentEmail)
                                .orElseThrow(() -> new RuntimeException("Agent not found"));
                List<Appointment> appts = appointmentRepository.findByAgent(agent);
                System.out.println("DEBUG FIND APPT: Agent=" + agentEmail + ", ID=" + agent.getId() + ", Count="
                                + appts.size());
                return appts;
        }

        public List<Appointment> getClientAppointments(String clientEmail) {
                User client = userRepository.findByEmail(clientEmail)
                                .orElseThrow(() -> new RuntimeException("Client not found"));
                return appointmentRepository.findByClient_Id(client.getId());
        }

        public Appointment updateAppointmentStatus(Long id, String status, String agentEmail) {
                if (id == null)
                        throw new IllegalArgumentException("ID cannot be null");
                Appointment appt = appointmentRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Appointment not found"));
                appt.setStatus(status);
                Appointment saved = appointmentRepository.save(appt);

                // Notify Logic...
                emailService.sendStatusUpdate(appt.getClient().getEmail(), status,
                                appt.getAvailability().getDate().toString(),
                                appt.getAvailability().getStartTime().toString());

                notificationRepository.save(new com.neurofleetx.backend.model.Notification(
                                appt.getClient().getEmail(),
                                "Appointment Update",
                                "Your appointment status is now: " + status,
                                status.equals("CONFIRMED") ? "SUCCESS" : "WARNING"));

                return saved;
        }

        public Appointment reassignClient(Long appointmentId, String newAgentEmail) {
                if (appointmentId == null)
                        throw new IllegalArgumentException("Appointment ID cannot be null");
                Appointment appt = appointmentRepository.findById(appointmentId)
                                .orElseThrow(() -> new RuntimeException("Appointment not found"));

                User newAgent = userRepository.findByEmail(newAgentEmail)
                                .orElseThrow(() -> new RuntimeException("New Agent not found"));

                AgentAvailability availability = appt.getAvailability();
                if (availability == null)
                        throw new RuntimeException("Appointment availability not found");

                User oldAgent = availability.getAgent();
                availability.setAgent(newAgent);
                availabilityRepository.save(availability);

                // Notify Logic...
                notificationRepository.save(new com.neurofleetx.backend.model.Notification(
                                newAgent.getEmail(),
                                "Appointment Reassigned",
                                "You have been assigned an existing appointment.",
                                "INFO"));

                notificationRepository.save(new com.neurofleetx.backend.model.Notification(
                                oldAgent.getEmail(),
                                "Appointment Removed",
                                "An appointment has been reassigned to another agent.",
                                "WARNING"));

                return appt;
        }

        public List<Appointment> getAllAppointments() {
                return appointmentRepository.findAll();
        }
}
