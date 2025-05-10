package com.api.service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import com.api.dto.AttendanceDto;
import com.api.entity.Attendance;

public interface AttendanceService {
	public List<Attendance> saveAttendance(AttendanceDto attendanceDTO);
	public void markHolidayForSchool(Long udiseNo, LocalDate date);
	public List<Attendance> markStudentsAbsent(List<Long> registerNumbers, Long udiseNo, LocalDate date);
	public void recalculateAttendanceStatistics(Long udiseNo, YearMonth monthYear);
	public List<Attendance> getAttendance();
	public List<Attendance> getBySchoolStdMonthnyear(long udiseNo, int std, YearMonth monthnyear);
	public List<Attendance> getAttendanceBetween(long studId,long udiseNo, YearMonth monthYear, YearMonth monthYearEnd);
}
