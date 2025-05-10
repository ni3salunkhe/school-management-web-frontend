package com.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.api.entity.ClassTeacher;
import com.api.entity.School;
@Repository
public interface ClassTeacherRepository extends JpaRepository<ClassTeacher, Long>{
	
	List<ClassTeacher> findBySchoolUdiseNo(School school);
	
	ClassTeacher findByStaffId(Long staffId);
}
