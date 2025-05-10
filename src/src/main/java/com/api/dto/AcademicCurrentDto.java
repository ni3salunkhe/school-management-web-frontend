package com.api.dto;

import java.sql.Date;
import java.util.List;

import lombok.Data;

@Data
public class AcademicCurrentDto {

	private long schoolUdiseNo;

	private long division;

	private long studentId;
	
	private String academicYear;

	private long classTeacher;
	
	private long standardId;

	private String status;

	private Date createdAt;
	
	private List<Long> studentIds;

}
