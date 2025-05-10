package com.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.api.dto.SubscriptionDto; // Import the DTO
import com.api.entity.School;
import com.api.entity.Subscription;
import com.api.repository.SubscriptionRepository;
import com.api.service.SchoolService;
import com.api.service.SubscriptionService;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/subscription")
public class SubscriptionController {

    @Autowired
    private SubscriptionService subscriptionService;

    @Autowired
    private SchoolService schoolService;
    
    @Autowired
    private SubscriptionRepository subscriptionRepository;

    // Check if the subscription is expired
    @GetMapping("/check/{udiseNumber}")
    public ResponseEntity<?> checkSubscription(@PathVariable String udiseNumber) {
       try {
        	
            Optional<Subscription> subscription = subscriptionRepository.findByUdiseNumber(Long.parseLong(udiseNumber));
        
        if (!subscription.isPresent()) {
            return ResponseEntity.status(HttpStatus.OK)
                    .body("Subscription not purchased yet for UDISE number: " + udiseNumber);
        }
            boolean isExpired = subscriptionService.isSubscriptionExpired(Long.parseLong(udiseNumber));
            return ResponseEntity.ok(isExpired);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid UDISE number format: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error checking subscription: " + e.getMessage());
        }
    }

    // Renew the subscription
    @PostMapping("/renew")
    public ResponseEntity<?> renewSubscription(@RequestBody SubscriptionDto subscriptionDto) {
        try {
            SubscriptionDto updatedSubscription = subscriptionService.renewSubscription(
                subscriptionDto.getUdiseNumber(), 
                subscriptionDto.getEnddate()
            );
            return ResponseEntity.ok(updatedSubscription);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid UDISE number format: " + e.getMessage());
        } catch (DateTimeParseException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid date format. Please use YYYY-MM-DD format: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error renewing subscription: " + e.getMessage());
        }
    }

    // Check if a school exists
    @GetMapping("/school-exists/{udiseNumber}")
    public ResponseEntity<?> checkSchoolExists(@PathVariable String udiseNumber) {
        try {
            long udiseNo = Long.parseLong(udiseNumber);
            School school = schoolService.getbyid(udiseNo);
            if (school != null) {
                return ResponseEntity.ok("School with UDISE number " + udiseNo + " exists");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("School with UDISE number " + udiseNo + " not found");
            }
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid UDISE number format: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error checking school: " + e.getMessage());
        }
    }

    @GetMapping("/{udiseNumber}")
    public ResponseEntity<?> getdata(@PathVariable("udiseNumber") long udiseNumber) {
        try {
            SubscriptionDto subscription = subscriptionService.getdata(udiseNumber);
            
            if (subscription == null) {
                return ResponseEntity.status(HttpStatus.OK)
                        .body("No subscription found for UDISE number: " + udiseNumber);
            }
            
            return ResponseEntity.ok(subscription);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving subscription: " + e.getMessage());
        }
    }
    
    // Create a new subscription
    @PostMapping("/create")
    public ResponseEntity<?> createSubscription(@RequestBody SubscriptionDto subscriptionDto) {
        try {
            // Using the SubscriptionDto received from the request body
            LocalDate start = subscriptionDto.getStartdate();  // Start date from the DTO
            LocalDate end = subscriptionDto.getEnddate();  // End date from the DTO

            // Validate input data
            if (start == null || end == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Start date and end date are required");
            }

            if (start.isAfter(end)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Start date cannot be after end date");
            }

            // Validate UDISE number
            if (subscriptionDto.getUdiseNumber() <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Valid UDISE number is required");
            }

            SubscriptionDto newSubscription = subscriptionService.createSubscription(
                    subscriptionDto.getUdiseNumber(), start, end);
            return ResponseEntity.ok(newSubscription);  // Return SubscriptionDto
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating subscription: " + e.getMessage());
        }
    }
    
    @GetMapping("/expiring-tomorrow/{udiseNo}")
    public ResponseEntity<?> getExpiringSubscriptionsByUdise(@PathVariable long udiseNo) {
    	Subscription subscription=subscriptionService.getExpiringTomorrowByUdise(udiseNo);
        return ResponseEntity.ok(subscription);
    }

}
