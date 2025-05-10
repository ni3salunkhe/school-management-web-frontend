package com.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import com.api.entity.LeavingInfo;
import com.api.entity.School;
import com.api.entity.Student;

@Repository
public interface LeavingInfoRepository extends JpaRepository<LeavingInfo, Long> {
	
	LeavingInfo findByStudentIdAndSchoolUdise(Student studentId,School schoolUdise);
	
}
