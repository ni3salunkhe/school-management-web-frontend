package com.api.serviceImpl;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.api.dto.AttendanceDto;
import com.api.entity.Attendance;
import com.api.entity.School;
import com.api.entity.Staff;
import com.api.entity.Student;
import com.api.repository.AttendanceRepository;
import com.api.repository.SchoolRepository;
import com.api.repository.StaffRepository;
import com.api.repository.StudentRepository;
import com.api.service.AttendanceService;

@Service
public class AttendanceServiceImpl implements AttendanceService {
	
	@Autowired
	SchoolRepository schoolRepository;
	
	@Autowired
	StaffRepository staffRepository;
	
	@Autowired
	StudentRepository studentRepository;
	
	@Autowired
	AttendanceRepository attendanceRepository;
	
	//Creating attendance of student
	@Override
	public List<Attendance> saveAttendance(AttendanceDto attendanceDTO) {
	    List<Attendance> savedAttendances = new ArrayList<>();
	    
	    // Get the school by UDISE number
	    School school = schoolRepository.findById(attendanceDTO.getUdiseNo())
	            .orElseThrow(() -> new RuntimeException("School not found"));
	    
	    // Get the staff member
	    Staff staff = staffRepository.findById(attendanceDTO.getStaffId())
	            .orElseThrow(() -> new RuntimeException("Staff not found"));
	    
	    // Get current month and year if not provided
	    YearMonth monthYear = (attendanceDTO.getMonthnyear() != null) ? 
	            attendanceDTO.getMonthnyear() : YearMonth.now();
	    
	    // Calculate days for this month
	    int totalDays = monthYear.lengthOfMonth();
	    int sundaysCount = countSundays(monthYear);
	    int workDays = totalDays - sundaysCount;
	    
	    // Process each register number in the array
	    for (Long registerNumber : attendanceDTO.getStudentRegisterId()) {
	    	boolean alreadyExists = attendanceRepository.existsByRegisterNumberAndMonthnyearAndSchool_UdiseNo(
	    	        registerNumber, monthYear, attendanceDTO.getUdiseNo());
	    	if (alreadyExists) {
	            // Skip saving duplicate
	            System.out.println("Attendance already exists for register number: " + registerNumber);
	            continue;
	        }
	        // Find student by register number and school
	        Student student = studentRepository.findByRegisterNumberAndSchool(registerNumber, school)
	                .orElseThrow(() -> new RuntimeException("Student with register number " + registerNumber + " not found in school with UDISE " + attendanceDTO.getUdiseNo()));
	        
	        Attendance attendance = new Attendance();
	        
	        // Set the values from DTO
	        attendance.setSchool(school);
	        attendance.setStudId(student);
	        attendance.setStaffId(staff);
	        attendance.setRegisterNumber(registerNumber);
	        attendance.setTeacherQualification(attendanceDTO.getTeacherQualification());
	        attendance.setDivision(attendanceDTO.getDivision());
	        attendance.setMedium(attendanceDTO.getMedium());
	        attendance.setStd(attendanceDTO.getStd());
	        attendance.setStdInWords(attendanceDTO.getStdInWords());
	        
	        // Set month and days calculations
	        attendance.setMonthnyear(monthYear);
	        attendance.setTotalDays(totalDays);
	        attendance.setSundays(sundaysCount);
	        attendance.setHolidays(0);
	        attendance.setWorkDays(workDays);
	        
	        // Initialize totals
	        attendance.setTotala(0);
	        attendance.setTotalp(workDays);
	        attendance.setTotalPPercentage(100.0);
	        
	        // Set status as active
	        attendance.setStatus("Active");
	        
	        // Initialize all days as Present 'P'
	        initializeDaysAsPresent(attendance);
	        
	        // Mark Sundays as 'S'
	        markSundaysForAttendance(attendance, monthYear);
	        List<Long> skippedRegisterNumbers = new ArrayList<>();

	        if (alreadyExists) {
	            skippedRegisterNumbers.add(registerNumber);
	            continue;
	        }
	        // Save and add to the result list
	        savedAttendances.add(attendanceRepository.save(attendance));
	    }
	    
	    return savedAttendances;
	}
	
	
	private int countSundays(YearMonth monthYear) {
        int year = monthYear.getYear();
        int month = monthYear.getMonthValue();
        int lengthOfMonth = monthYear.lengthOfMonth();
        
        int sundayCount = 0;
        for (int day = 1; day <= lengthOfMonth; day++) {
            LocalDate date = LocalDate.of(year, month, day);
            if (date.getDayOfWeek() == DayOfWeek.SUNDAY) {
                sundayCount++;
            }
        }
        
        return sundayCount;
    }
	// Initialize all days as Present
    private void initializeDaysAsPresent(Attendance attendance) {
        for (int day = 1; day <= 31; day++) {
            setDayStatus(attendance, day, "P");
        }
    }
    
    // Helper method to get the status for a specific day
    private String getDayStatus(Attendance attendance, int day) {
        return switch (day) {
            case 1 -> attendance.getDay1();
            case 2 -> attendance.getDay2();
            case 3 -> attendance.getDay3();
            case 4 -> attendance.getDay4();
            case 5 -> attendance.getDay5();
            case 6 -> attendance.getDay6();
            case 7 -> attendance.getDay7();
            case 8 -> attendance.getDay8();
            case 9 -> attendance.getDay9();
            case 10 -> attendance.getDay10();
            case 11 -> attendance.getDay11();
            case 12 -> attendance.getDay12();
            case 13 -> attendance.getDay13();
            case 14 -> attendance.getDay14();
            case 15 -> attendance.getDay15();
            case 16 -> attendance.getDay16();
            case 17 -> attendance.getDay17();
            case 18 -> attendance.getDay18();
            case 19 -> attendance.getDay19();
            case 20 -> attendance.getDay20();
            case 21 -> attendance.getDay21();
            case 22 -> attendance.getDay22();
            case 23 -> attendance.getDay23();
            case 24 -> attendance.getDay24();
            case 25 -> attendance.getDay25();
            case 26 -> attendance.getDay26();
            case 27 -> attendance.getDay27();
            case 28 -> attendance.getDay28();
            case 29 -> attendance.getDay29();
            case 30 -> attendance.getDay30();
            case 31 -> attendance.getDay31();
            default -> throw new IllegalArgumentException("Invalid day: " + day);
        };
    }
    
    private void setDayStatus(Attendance attendance, int day, String status) {
        switch (day) {
            case 1 -> attendance.setDay1(status);
            case 2 -> attendance.setDay2(status);
            case 3 -> attendance.setDay3(status);
            case 4 -> attendance.setDay4(status);
            case 5 -> attendance.setDay5(status);
            case 6 -> attendance.setDay6(status);
            case 7 -> attendance.setDay7(status);
            case 8 -> attendance.setDay8(status);
            case 9 -> attendance.setDay9(status);
            case 10 -> attendance.setDay10(status);
            case 11 -> attendance.setDay11(status);
            case 12 -> attendance.setDay12(status);
            case 13 -> attendance.setDay13(status);
            case 14 -> attendance.setDay14(status);
            case 15 -> attendance.setDay15(status);
            case 16 -> attendance.setDay16(status);
            case 17 -> attendance.setDay17(status);
            case 18 -> attendance.setDay18(status);
            case 19 -> attendance.setDay19(status);
            case 20 -> attendance.setDay20(status);
            case 21 -> attendance.setDay21(status);
            case 22 -> attendance.setDay22(status);
            case 23 -> attendance.setDay23(status);
            case 24 -> attendance.setDay24(status);
            case 25 -> attendance.setDay25(status);
            case 26 -> attendance.setDay26(status);
            case 27 -> attendance.setDay27(status);
            case 28 -> attendance.setDay28(status);
            case 29 -> attendance.setDay29(status);
            case 30 -> attendance.setDay30(status);
            case 31 -> attendance.setDay31(status);
            default -> throw new IllegalArgumentException("Invalid day: " + day);
        }
    }
    
    private void markSundaysForAttendance(Attendance attendance, YearMonth monthYear) {
        int year = monthYear.getYear();
        int month = monthYear.getMonthValue();
        int lengthOfMonth = monthYear.lengthOfMonth();
        	
        for (int day = 1; day <= lengthOfMonth; day++) {
            LocalDate date = LocalDate.of(year, month, day);
            if (date.getDayOfWeek() == DayOfWeek.SUNDAY) {
                setDayStatus(attendance, day, "S");
            }
        }
    }
    
    //setting an holiday for a school
    @Override
    public void markHolidayForSchool(Long udiseNo, LocalDate date) {
        YearMonth monthYear = YearMonth.from(date);
        int dayOfMonth = date.getDayOfMonth();
        
        // Find the school
        School school = schoolRepository.findById(udiseNo)
                .orElseThrow(() -> new RuntimeException("School not found"));
                
        // Find all attendance records for the given month and school
        List<Attendance> attendances = attendanceRepository.findBySchool_UdiseNoAndMonthnyear(udiseNo, monthYear);
        
        if (attendances.isEmpty()) {
            throw new RuntimeException("No attendance records found for school with UDISE: " + udiseNo + " for " + monthYear);
        }
        
        boolean isNewHoliday = false;
        
        for (Attendance attendance : attendances) {
            // Do not mark holidays on Sundays
            String currentStatus = getDayStatus(attendance, dayOfMonth);
            if (!"S".equalsIgnoreCase(currentStatus) && !"H".equalsIgnoreCase(currentStatus)) {
                isNewHoliday = true;
                
                // Only update counts if changing from Present to Holiday
                if ("P".equalsIgnoreCase(currentStatus)) {
                    attendance.setTotalp(attendance.getTotalp() - 1);
                } else if ("A".equalsIgnoreCase(currentStatus)) {
                    attendance.setTotala(attendance.getTotala() - 1);
                }
                
                setDayStatus(attendance, dayOfMonth, "H");
                
                // Update workdays (reduce by 1 since this day is now a holiday)
                attendance.setWorkDays(attendance.getWorkDays() - 1);
                
                // Recalculate the percentage
                double percentage = (attendance.getWorkDays() > 0) 
                    ? ((double) attendance.getTotalp() / attendance.getWorkDays()) * 100 
                    : 0;
                attendance.setTotalPPercentage(percentage);
                
                attendanceRepository.save(attendance);
            }

        }
    }
    
	@Override
	public List<Attendance> markStudentsAbsent(List<Long> registerNumbers, Long udiseNo, LocalDate date) {
	    List<Attendance> updatedAttendances = new ArrayList<>();
	    
	    // Get the school by UDISE number
	    School school = schoolRepository.findById(udiseNo)
	            .orElseThrow(() -> new RuntimeException("School not found with UDISE: " + udiseNo));
	    
	    // Extract month/year and day from the date
	    YearMonth monthYear = YearMonth.from(date);
	    int dayOfMonth = date.getDayOfMonth();
	    
	    for (Long registerNumber : registerNumbers) {
	        // Find the student with matching register number and school
	        Student student = studentRepository.findByRegisterNumberAndSchool(registerNumber, school)
	                .orElseThrow(() -> new RuntimeException("Student not found with register number: " + 
	                        registerNumber + " in school with UDISE: " + udiseNo));
	        
	        // Find attendance record for this student and month
	        Optional<Attendance> optionalAttendance = attendanceRepository
	                .findByStudIdAndSchoolAndMonthnyear(student, school, monthYear);
	        
	        if (!optionalAttendance.isPresent()) {
	            // Skip if no attendance record exists
	            continue;
	        }
	        
	        Attendance attendance = optionalAttendance.get();
	        String currentStatus = getDayStatus(attendance, dayOfMonth);
	        
	        // Only mark absent if the day is currently marked as Present (P)
	        if ("P".equalsIgnoreCase(currentStatus)) {
	            // Set the day as "A" (Absent)
	            setDayStatus(attendance, dayOfMonth, "A");
	    
	            // Update absent count and present count
	            attendance.setTotala(attendance.getTotala() + 1);
	            attendance.setTotalp(attendance.getTotalp() - 1);
	            
	            // Recalculate the percentage based on workdays
	            double percentage = (attendance.getWorkDays() > 0) 
	                ? ((double) attendance.getTotalp() / attendance.getWorkDays()) * 100 
	                : 0;
	            attendance.setTotalPPercentage(percentage);
	    
	            // Save the updated record
	            updatedAttendances.add(attendanceRepository.save(attendance));
	        } else {
	            // Add to result list even if not changed
	            updatedAttendances.add(attendance);
	        }
	    }
	    
	    return updatedAttendances;
	}

	@Override
	public void recalculateAttendanceStatistics(Long udiseNo, YearMonth monthYear) {
	    // Find the school
	    School school = schoolRepository.findById(udiseNo)
	            .orElseThrow(() -> new RuntimeException("School not found"));
	            
	    // Find all attendance records for the given month and school
	    List<Attendance> attendances = attendanceRepository.findBySchoolAndMonthnyear(school, monthYear);
	    
	    for (Attendance attendance : attendances) {
	        // Count present, absent, holidays, and Sundays
	        int presentCount = 0;
	        int absentCount = 0;
	        int holidayCount = 0;
	        int sundayCount = 0;
	        
	        int daysInMonth = monthYear.lengthOfMonth();
	        
	        for (int day = 1; day <= daysInMonth; day++) {
	            String status = getDayStatus(attendance, day);
	            switch (status.toUpperCase()) {
	                case "P" -> presentCount++;
	                case "A" -> absentCount++;
	                case "H" -> holidayCount++;
	                case "S" -> sundayCount++;
	            }
	        }
	        
	        // Update the attendance record
	        attendance.setTotalp(presentCount);
	        attendance.setTotala(absentCount);
	        attendance.setHolidays(holidayCount);
	        attendance.setSundays(sundayCount);
	        
	        // Work days are days student should be present (excluding Sundays and holidays)
	        int workDays = daysInMonth - (sundayCount + holidayCount);
	        attendance.setWorkDays(workDays);
	        
	        // Calculate percentage
	        double percentage = (workDays > 0) 
	            ? ((double) presentCount / workDays) * 100 
	            : 0;
	        attendance.setTotalPPercentage(percentage);
	        
	        attendanceRepository.save(attendance);
	    }
	}
	@Override
	public List<Attendance> getAttendance() {
		// TODO Auto-generated method stub
		return attendanceRepository.findAll();
	}
	@Override
	public List<Attendance> getBySchoolStdMonthnyear(long udiseNo, int std, YearMonth monthnyear) {
		// TODO Auto-generated method stub
		School school = schoolRepository.findById(udiseNo)
	            .orElseThrow(() -> new RuntimeException("School not found"));
		return attendanceRepository.findBySchoolAndStdAndMonthnyear(school, std, monthnyear);
	}


	@Override
	public List<Attendance> getAttendanceBetween(long studId,long udiseNo, YearMonth monthYear, YearMonth monthYearEnd) {
		// TODO Auto-generated method stub
		School school = schoolRepository.findById(udiseNo)
	            .orElseThrow(() -> new RuntimeException("School not found"));
		Student student = studentRepository.findById(studId).orElseThrow(()->new RuntimeException("Student not found"));
		return attendanceRepository.findByStudIdAndSchoolAndMonthnyearBetween(student,school, monthYear, monthYearEnd);
	}
	
}
