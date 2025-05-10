package com.api.dto;

import java.sql.Date;

import com.api.entity.Student;

import lombok.Data;

@Data
public class StudentDto {

	private long registerNumber;

	private long school;

	private String apparId;

	private String studentId;

	private String adhaarNumber;

	private String gender;

	private String surName;
	private String studentName;
	private String fatherName;
	private String motherName;
	private String nationality;
	private String motherTongue;
	private String religion;
	private String caste;
	private String subCast;
	private String residentialAddress;
	private String mobileNo;

	private String birthPlace;
	
	private long villageOfBirth;

	private long tehasilOfBirth;

	private long districtOfBirth;

	private long stateOfBirth;

	private Date dateOfBirth;
	private String dateOfBirthInWord;
	private String lastSchoolUdiseNo;
	private Date admissionDate;
	private long whichStandardAdmitted;
	private Date createdAt;
	
	private String ebcInformation;
	private String minorityInformation;
	private String casteCategory;
}
