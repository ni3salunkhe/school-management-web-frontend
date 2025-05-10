package com.api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.entity.AcademicCurrent;
import com.api.entity.AcademicOld;
import com.api.entity.School;
import com.api.entity.Student;
import com.api.service.AcademicCurrentService;
import com.api.service.AcademicOldService;
import com.api.service.StudentService;

@RestController
@RequestMapping("/academicold")
public class AcademicOldController {

	@Autowired
	private AcademicCurrentService academicCurrentService;

	@Autowired
	private StudentService studentService;

	@Autowired
	private AcademicOldService academicOldService;

	@GetMapping("/lastyear/{id}")
	public ResponseEntity<?> getLastYearData(@PathVariable long id) {
		AcademicCurrent academicCurrent = academicCurrentService.getbyid(id);
		if (academicCurrent == null || academicCurrent.getStudentId() == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Academic current record or student not found");
		}

		Student student = studentService.getbyid(academicCurrent.getStudentId().getId());
		if (student == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Student not found");
		}

		List<AcademicOld> academicOldList = academicOldService.getAcademicOldByStudent(student);
		if (academicOldList == null || academicOldList.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No academic old data found for student");
		}

		long currentStandard = academicCurrent.getStandard().getStandard();
		if (currentStandard > 1) {
			long prevStandard = currentStandard - 1;
			for (AcademicOld old : academicOldList) {
				if (old.getClassTeacher().getStandardMaster().getStandard() == prevStandard) {
					return ResponseEntity.ok(old);
				}
			}
		}

		return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Previous academic year data not found");
	}
}
