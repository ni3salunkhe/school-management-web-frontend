package com.api.serviceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.api.entity.Subscription;
import com.api.repository.SubscriptionRepository;
import com.api.service.SchoolService;
import com.api.service.SubscriptionService;
import com.api.service.TimeService;
import com.api.dto.SubscriptionDto;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class SubscriptionServiceImpl implements SubscriptionService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    private TimeService timeService;  // Injected time service

    @Autowired
    private SchoolService schoolService;

    @Autowired
    public SubscriptionServiceImpl(TimeService timeService) {
        this.timeService = timeService;
    }

    // Helper method to convert Subscription to SubscriptionDto
    private SubscriptionDto convertToDto(Subscription subscription) {
        SubscriptionDto subscriptionDto = new SubscriptionDto();
        subscriptionDto.setId(subscription.getId());
        subscriptionDto.setUdiseNumber(subscription.getSchoolUdiseNo().getUdiseNo());
        subscriptionDto.setStartdate(subscription.getSubscriptionStartDate());
        subscriptionDto.setEnddate(subscription.getSubscriptionEndDate());
        return subscriptionDto;
    }

    // Check if the subscription is expired
    public boolean isSubscriptionExpired(long udiseNumber) {
        if (udiseNumber <= 0) {
            throw new IllegalArgumentException("Invalid UDISE number: " + udiseNumber);
        }

        try {
            Optional<Subscription> subscriptionOpt = subscriptionRepository.findByUdiseNumber(udiseNumber);
            if (!subscriptionOpt.isPresent()) {
                throw new IllegalArgumentException("No subscription found for UDISE number: " + udiseNumber);
            }
            if (subscriptionOpt.isPresent()) {
                Subscription subscription = subscriptionOpt.get();
                LocalDate currentDate = timeService.getCurrentDate();
                return currentDate.isAfter(subscription.getSubscriptionEndDate());
            }
            return true; // If no subscription found, consider it expired
        } catch (Exception e) {
            throw new RuntimeException("Error checking subscription expiration: " + e.getMessage(), e);
        }
    }

    // Renew the subscription and return SubscriptionDto
    public SubscriptionDto renewSubscription(long udiseNumber, LocalDate newEndDate) {
        if (udiseNumber <= 0) {
            throw new IllegalArgumentException("Invalid UDISE number: " + udiseNumber);
        }

        if (newEndDate == null) {
            throw new IllegalArgumentException("New end date cannot be null");
        }

        LocalDate currentDate = timeService.getCurrentDate();
        if (newEndDate.isBefore(currentDate)) {
            throw new IllegalArgumentException("New end date cannot be in the past");
        }

        try {
            Optional<Subscription> subscriptionOpt = subscriptionRepository.findByUdiseNumber(udiseNumber);

            if (subscriptionOpt.isPresent()) {
                Subscription subscription = subscriptionOpt.get();
                subscription.setSubscriptionEndDate(newEndDate);
                Subscription updatedSubscription = subscriptionRepository.save(subscription); // Save the renewed subscription
                return convertToDto(updatedSubscription);  // Convert to DTO before returning
            } else {
                throw new IllegalArgumentException("Subscription not found for the given UDISE number: " + udiseNumber);
            }
        } catch (IllegalArgumentException e) {
            throw e; // Re-throw IllegalArgumentException as is
        } catch (Exception e) {
            throw new RuntimeException("Error renewing subscription: " + e.getMessage(), e);
        }
    }

    // Create a new subscription and return SubscriptionDto
    public SubscriptionDto createSubscription(long udiseNumber, LocalDate startDate, LocalDate endDate) {
        if (udiseNumber <= 0) {
            throw new IllegalArgumentException("Invalid UDISE number: " + udiseNumber);
        }

        // Validate school exists
        var school = schoolService.getbyid(udiseNumber);
        if (school == null) {
            throw new IllegalArgumentException("School with UDISE number " + udiseNumber + " not found");
        }

        // Check if subscription already exists
        Optional<Subscription> existingSubscription = subscriptionRepository.findByUdiseNumber(udiseNumber);
        if (existingSubscription.isPresent()) {
            throw new IllegalArgumentException("Subscription already exists for school with UDISE number " + udiseNumber);
        }

        try {
            // Create new subscription
            Subscription subscription = new Subscription();
            subscription.setSchoolUdiseNo(school);
            subscription.setSubscriptionStartDate(startDate);
            subscription.setSubscriptionEndDate(endDate);
            Subscription savedSubscription = subscriptionRepository.save(subscription);
            return convertToDto(savedSubscription);  // Convert to DTO before returning
        } catch (Exception e) {
            throw new RuntimeException("Failed to create subscription: " + e.getMessage(), e);
        }
    }

	@Override
	public SubscriptionDto getdata(long udiseNumber) {
		Optional<Subscription> subscription = subscriptionRepository.findByUdiseNumber(udiseNumber);
		return subscription.map(this::convertToDto).orElse(null);
	}

	@Override
	public Subscription getExpiringTomorrowByUdise(long udiseNo) {
	    LocalDate tomorrow = LocalDate.now().plusDays(1);
	    return subscriptionRepository.findByUdiseNoAndEndDate(udiseNo, tomorrow);
	}


}
