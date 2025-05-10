package com.api.serviceImpl;

import java.time.LocalDate;
import java.time.ZoneOffset;
import org.springframework.stereotype.Service;
import java.time.Instant;

import com.api.service.TimeService;
@Service
public class TimeServiceImpl implements TimeService {
	public LocalDate getCurrentDate() {
        // Get the current time in UTC
        Instant now = Instant.now(); // This gets the current UTC time
        return now.atOffset(ZoneOffset.UTC).toLocalDate();  // Convert to LocalDate
    }
}