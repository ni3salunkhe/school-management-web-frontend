package com.api.entity;

import java.sql.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import lombok.Data;

@Entity
@Data
public class AcademicCurrent {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;
	
	@ManyToOne
	@JoinColumn(name = "SchoolUdiseNo")
	private School schoolUdiseNo;
	
	@ManyToOne
	@JoinColumn(name="StandardDivision")
	private Division division;
	
	@OneToOne
	private Student studentId;
	
	@ManyToOne
	@JoinColumn(name="Standard")
	private StandardMaster standard;
	
	private String academicYear;
	
	@ManyToOne
	@JoinColumn(name = "teacher")
	private ClassTeacher classTeacher;
	
	private String status;
	
	private Date createdAt;
}
