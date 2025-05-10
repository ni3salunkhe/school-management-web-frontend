package com.api.dto;


import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import lombok.Data;

@Data
public class AttendanceDto {
	private List<Long> studentRegisterId;
	private long udiseNo;
	private long staffId;
	private YearMonth monthnyear;
	private String teacherQualification;
	private String division;
	private String medium;
	private int std;
	private String stdInWords;
	private String status;
	private LocalDate day;
}
