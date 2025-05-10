package com.api.dto;

import java.util.List;

import com.api.entity.Student;

import lombok.Data;

@Data
public class ClassTeacherDto {
	
	private long standardMaster;
	
	private long division;
	
	private long staff;
	
	private long schoolUdiseNo;
	
	
	private String standardName;
    private String divisionName;
    private List<Student> students;
	
}
