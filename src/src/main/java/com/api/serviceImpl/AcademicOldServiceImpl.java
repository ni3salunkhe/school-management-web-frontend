package com.api.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.api.entity.AcademicOld;
import com.api.entity.Student;
import com.api.repository.AcademicOldRepository;
import com.api.service.AcademicOldService;

@Service
public class AcademicOldServiceImpl implements AcademicOldService{

	@Autowired
	private AcademicOldRepository academicOldRepository;
	
	@Override
	public AcademicOld post(AcademicOld academicOld) {
		// TODO Auto-generated method stub
		return academicOldRepository.save(academicOld);
	}

	@Override
	public List<AcademicOld> getAcademicOldByStudent(Student student) {
		// TODO Auto-generated method stub
		return academicOldRepository.findByStudentId(student);
	}
	
	
}
