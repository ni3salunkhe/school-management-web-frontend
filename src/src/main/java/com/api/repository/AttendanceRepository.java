package com.api.repository;

import com.api.entity.Attendance;
import com.api.entity.School;
import com.api.entity.Staff;
import com.api.entity.Student;

import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;


import com.api.entity.Attendance;
import com.api.entity.School;
import com.api.entity.Student;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

	List<Attendance> findBySchool_UdiseNoAndMonthnyear(long udiseNo, YearMonth monthnyear);
	
	List<Attendance> findByRegisterNumberAndSchoolAndMonthnyear(Long registerNumber, School school, YearMonth monthYear);
	
	Optional<Attendance> findByStudIdAndSchoolAndMonthnyear(Student student, School school, YearMonth monthYear);
	
	List<Attendance> findBySchoolAndMonthnyear(School school, YearMonth monthYear);
	
	List<Attendance> findBySchoolAndStdAndMonthnyear(School school, int std, YearMonth monthnyear);
	
	List<Attendance> findBySchoolAndStdAndRegisterNumberAndMonthnyear(School school, int std, long registerNumber, YearMonth monthnyear);

	List<Attendance> findByMonthnyear(YearMonth monthnyear);

	List<Attendance> findBySchool(School school);
	
	boolean existsByRegisterNumberAndMonthnyearAndSchool_UdiseNo(Long registerNumber, YearMonth monthnyear, Long udiseNo);

	List<Attendance> findByStudIdAndSchoolAndMonthnyearBetween(Student studId, School udiseNo, YearMonth monthnyear, YearMonth monthnyearend);

}
