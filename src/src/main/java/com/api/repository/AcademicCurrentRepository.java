package com.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.api.entity.AcademicCurrent;
import com.api.entity.Attendance;
import com.api.entity.School;
import com.api.entity.StandardMaster;
import com.api.entity.Student;

@Repository
public interface AcademicCurrentRepository extends JpaRepository<AcademicCurrent, Long>{
	
	List<AcademicCurrent> findByClassTeacherId(Long classTeacherId);
	
	  // Find by both studentId and schoolUdiseNo
    Optional<AcademicCurrent> findByStudentIdAndSchoolUdiseNo(Student studentId, School schoolUdiseNo);
    
    // Find all records for a specific student
    List<AcademicCurrent> findByStudentId(Student studentId);
    
    // Find all records for a specific school
    List<AcademicCurrent> findBySchoolUdiseNo(School schoolUdiseNo);
    
    List<AcademicCurrent> findBySchoolUdiseNoAndClassTeacherId(Optional<School> school, Long teacherId);
    
}
