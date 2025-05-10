package com.api.controller;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.api.dto.AttendanceDto;
import com.api.entity.Attendance;
import com.api.service.AttendanceService;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {
	
	@Autowired
	AttendanceService attendanceService;

	@PostMapping("/bulk")
    public ResponseEntity<?> createBulkAttendance(@RequestBody AttendanceDto attendanceDto) {
        List<Attendance> attendances = attendanceService.saveAttendance(attendanceDto);
        return ResponseEntity.ok(attendances);
    }
	
	@PostMapping("/mark-holiday/school/{udiseNo}/{date}")
    public ResponseEntity<String> markHolidayForSchool(
            @PathVariable Long udiseNo,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        attendanceService.markHolidayForSchool(udiseNo, date);
        return ResponseEntity.ok("Day marked as Holiday for school UDISE: " + udiseNo + " on " + date);
    }
	
	 @PutMapping("/mark-absent")
	    public ResponseEntity<List<Attendance>> markStudentsAbsent(@RequestBody AttendanceDto absenceRequest) {
	        List<Attendance> updatedAttendances = attendanceService.markStudentsAbsent(
	                absenceRequest.getStudentRegisterId(),
	                absenceRequest.getUdiseNo(),
	                absenceRequest.getDay()
	        );
	        return new ResponseEntity<>(updatedAttendances, HttpStatus.OK);
	    }
	 
	 @PostMapping("/recalculate/school/{udiseNo}")
	    public ResponseEntity<String> recalculateStatisticsForSchool(
	            @RequestBody AttendanceDto attendanceDto) {
	        
	        attendanceService.recalculateAttendanceStatistics(attendanceDto.getUdiseNo(), attendanceDto.getMonthnyear());
	        return ResponseEntity.ok("Attendance statistics recalculated for school UDISE: " + attendanceDto.getUdiseNo() + " for month: " + attendanceDto.getMonthnyear());
	    }
	 
	 @GetMapping("/")
	 	public ResponseEntity<?> getAttendanceData(){
		 List<Attendance> attendances=attendanceService.getAttendance();
		 return ResponseEntity.ok(attendances);
	 }
	 
	 @GetMapping("/by-udise-std-monthnyear/{udiseNo}/{std}/{monthnyear}")
	 	public ResponseEntity<?> getAttndanceConditionally(@PathVariable long udiseNo, @PathVariable int std, @PathVariable YearMonth monthnyear){
		 List<Attendance> attendances=attendanceService.getBySchoolStdMonthnyear(udiseNo, std, monthnyear);
		 return ResponseEntity.ok(attendances);
	 }
	 
	 @GetMapping("/by-udise-monthnyear/{studId}/{udiseNo}/{monthnyear}/{monthnyearend}")
	 	public ResponseEntity<?> getDataWithinMonth(@PathVariable long studId, @PathVariable long udiseNo, @PathVariable YearMonth monthnyear, @PathVariable YearMonth monthnyearend ){
		 List<Attendance> attendance=attendanceService.getAttendanceBetween(studId,udiseNo, monthnyear, monthnyearend);
		 
		 return ResponseEntity.ok(attendance);
	 }
}
