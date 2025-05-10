package com.api.dto;

import java.sql.Date;

import lombok.Data;

@Data
public class ScholarshipDto {

	private long studentRegisterId;

	private String fatherFullName;

	private String nameOfEligibleScholarship;

	private Date createdAt;

}
