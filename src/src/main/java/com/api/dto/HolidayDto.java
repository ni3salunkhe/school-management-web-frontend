package com.api.dto;

import java.sql.Date;

import com.api.entity.School;
import com.api.entity.Staff;

import lombok.Data;
@Data
public class HolidayDto{
	
	
	private long id;
	private String reason;
	private long createdBy;
	private long udise;
	private Date holidayDate;
	
}
