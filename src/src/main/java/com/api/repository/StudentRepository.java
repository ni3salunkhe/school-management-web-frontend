package com.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.api.entity.School;

import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.api.entity.Student;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByRegisterNumber(Long registerNumber);
    
    @Query("SELECT s FROM Student s WHERE s.school.udiseNo = :udiseNo")
    List<Student> findBySchoolUdiseNo(long udiseNo);
    
    @Query("SELECT s FROM Student s WHERE s.registerNumber IN :registerNumbers AND s.school.udiseNo = :udiseNo")
    List<Student> findByRegisterNumberInAndSchoolUdiseNo(List<Long> registerNumbers, Long udiseNo);
    
    Optional<Student> findByRegisterNumberAndSchool(Long registerNumber, School school);


	
	List<Student> findBySchool_UdiseNo(long udiseNo);
	
	Student findByRegisterNumber(long registerNumber);
	
	 @Query("SELECT s FROM Student s WHERE s.school.udiseNo = :udise " +
	           "AND (:surName IS NULL OR s.surName LIKE %:surName%) " +
	           "AND (:studentName IS NULL OR s.studentName LIKE %:studentName%) " +
	           "AND (:fatherName IS NULL OR s.fatherName LIKE %:fatherName%) " +
	           "AND (:motherName IS NULL OR s.motherName LIKE %:motherName%)")
	    List<Student> searchStudentsByUdise(@Param("udise") Long udise,
	                                        @Param("surName") String surName,
	                                        @Param("studentName") String studentName,
	                                        @Param("fatherName") String fatherName,
	                                        @Param("motherName") String motherName);
	 
	 @Query("SELECT s FROM Student s " +
		       "WHERE s.school.udiseNo = :udise " +
		       "AND s.id NOT IN (SELECT ac.studentId.id FROM AcademicCurrent ac) " +
		       "AND s.id NOT IN (SELECT aco.studentId.id FROM AcademicOld aco)")
		List<Student> findUnassignedStudentsBySchoolUdise(@Param("udise") Long udise);

	 

	
}
