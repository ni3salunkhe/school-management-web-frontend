package com.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.entity.AcademicOld;
import com.api.entity.Student;

public interface AcademicOldRepository extends JpaRepository<AcademicOld, Long>{

	List<AcademicOld> findByStudentId(Student student);
	
}
