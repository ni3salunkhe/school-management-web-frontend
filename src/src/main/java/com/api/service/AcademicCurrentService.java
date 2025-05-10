package com.api.service;

import java.util.List;
import java.util.Optional;

import com.api.entity.AcademicCurrent;
import com.api.entity.School;
import com.api.entity.Student;

public interface AcademicCurrentService {
	
	public AcademicCurrent post(AcademicCurrent academicCurrent);
	
	public List<AcademicCurrent> getdata();
	
	public AcademicCurrent getbyid(long id);
	
	public void deletedata(long id);
	
	public List<AcademicCurrent> getByClassTeacheId(long classTeacherId);
	
	public Optional<AcademicCurrent> getAcademicCurrentByStudentAndSchool(Long studentId, long schoolUdiseNo);
	
	public List<AcademicCurrent> getAcademicsByUdiseAndTeacherId(long udiseNo, long teacherId);
	
	public List<AcademicCurrent> getBySchool(long schoolUdiseNo);
}
