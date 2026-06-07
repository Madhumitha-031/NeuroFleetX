package com.neurofleetx.backend.dto;

import lombok.Data;

@Data
public class BookingRequest {
    private String email;
    private String reason;
    private Double destinationLat;
    private Double destinationLng;
}
