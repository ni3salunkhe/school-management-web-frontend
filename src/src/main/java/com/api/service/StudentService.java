package com.api.service;

import java.util.List;

import com.api.entity.School;
import com.api.entity.Student;

public interface StudentService {

	public Student post(Student student);

	public List<Student> getdata();

	public Student getbyid(long id);

	public void deletedata(long id);

	public List<Student> getAllDataByudise(long udise);

	public Student findByRegisteNo(long registerNumber);

	public List<Student> searchStudentsByUdise(Long udise, String surName, String studentName, String fatherName,
			String motherName);

	public List<Student> getUnassignedStudents(Long udise);
	
	List<Student> getStudentsBySchool(long udiseNo);
	
}
