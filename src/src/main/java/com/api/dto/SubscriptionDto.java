package com.api.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class SubscriptionDto {

    private Long id; // Subscription ID
    private long udiseNumber; // The unique identifier of the institution or user
    private LocalDate startdate; // Start date of the subscription
    private LocalDate enddate; // End date of the subscription
}
