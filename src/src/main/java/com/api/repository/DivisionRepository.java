package com.api.repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.api.entity.Division;
import com.api.entity.School;

@Repository
public interface DivisionRepository extends JpaRepository<Division, Long>{
	
	Division findByName(String name);
	
	List<Division> findBySchoolUdiseNo(School school);
}
