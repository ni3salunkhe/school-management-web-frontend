package com.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.api.entity.Staff;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {

	@Query("SELECT s FROM Staff s WHERE s.id NOT IN (SELECT ct.staff.id FROM ClassTeacher ct)")
	List<Staff> findUnassignedStaff();

	// In StaffRepository.java
	List<Staff> findBySchool_UdiseNo(long udiseNo);

	Staff findByUsername(String username);
	
	@Query("SELECT s FROM Staff s JOIN FETCH s.school WHERE s.username = :username")
	Staff findByUsernameWithSchool(@Param("username") String username);
	
	@Query("SELECT s FROM Staff s WHERE s.school.udiseNo = :udiseNo AND s.username = :username")
    Staff findBySchoolUdiseNoAndUsername(long udiseNo, String username);
}
