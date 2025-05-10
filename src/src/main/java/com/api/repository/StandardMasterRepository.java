package com.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.api.entity.StandardMaster;

@Repository
public interface StandardMasterRepository extends JpaRepository<StandardMaster, Long> {

	@Query("SELECT s FROM StandardMaster s WHERE s.schoolUdiseNo.udiseNo = :udiseNo")
	List<StandardMaster> findStandardsBySchool(long udiseNo);
	
}
