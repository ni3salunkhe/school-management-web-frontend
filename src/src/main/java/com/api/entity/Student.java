package com.api.entity;

import java.sql.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class Student {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;
	
	private long registerNumber;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "school_udise_no", nullable = false)
	private School school;
	
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
	
	@ManyToOne
	private Village villageOfBirth;
	@ManyToOne
	private Tehsil tehasilOfBirth;
	@ManyToOne
	private District districtOfBirth;
	@ManyToOne
	private State stateOfBirth;
	
	private Date dateOfBirth;
	private String dateOfBirthInWord;
	private String lastSchoolUdiseNo;
	private Date admissionDate;
	
	@ManyToOne
	private StandardMaster whichStandardAdmitted;
	private Date createdAt;
	private String ebcInformation;
	private String minorityInformation;
	private String casteCategory;
	
}
