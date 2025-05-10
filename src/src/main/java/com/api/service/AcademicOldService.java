package com.api.service;

import java.util.List;

import com.api.entity.AcademicOld;
import com.api.entity.Student;

public interface AcademicOldService {
	
	public AcademicOld post(AcademicOld academicOld);
	
	public List<AcademicOld> getAcademicOldByStudent(Student student);
	
}
