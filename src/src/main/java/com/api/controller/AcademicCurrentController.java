package com.api.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.api.dto.AcademicCurrentDto;
import com.api.entity.AcademicCurrent;
import com.api.entity.AcademicOld;
import com.api.entity.School;
import com.api.entity.Student;
import com.api.service.AcademicCurrentService;
import com.api.service.AcademicOldService;
import com.api.service.ClassTeacherService;
import com.api.service.DivisionService;
import com.api.service.SchoolService;
import com.api.service.StandardMasterService;
import com.api.service.StudentService;

@RestController
@RequestMapping("/academic")
public class AcademicCurrentController {

	@Autowired
	private AcademicCurrentService academicCurrentService;

	@Autowired
	private ClassTeacherService classTeacherService;

	@Autowired
	private DivisionService divisionService;

	@Autowired
	private SchoolService schoolService;

	@Autowired
	private StudentService studentService;

	@Autowired
	private AcademicOldService academicOldService;

	@Autowired
	private StandardMasterService standardMasterService;

	// Save Academic Current Data
	@PostMapping("/")
	public ResponseEntity<AcademicCurrent> savedata(@RequestBody AcademicCurrentDto academicCurrentDto) {
		AcademicCurrent academicCurrent = new AcademicCurrent();
		academicCurrent.setAcademicYear(academicCurrentDto.getAcademicYear());
		academicCurrent.setClassTeacher(classTeacherService.getbyid(academicCurrentDto.getClassTeacher()));
		academicCurrent.setDivision(divisionService.getbyid(academicCurrentDto.getDivision()));
		academicCurrent.setStudentId(studentService.getbyid(academicCurrentDto.getStudentId()));
		academicCurrent.setSchoolUdiseNo(schoolService.getbyid(academicCurrentDto.getSchoolUdiseNo()));
		academicCurrent.setStandard(standardMasterService.getbyid(academicCurrentDto.getStandardId()));
		academicCurrent.setCreatedAt(academicCurrentDto.getCreatedAt());
		academicCurrent.setStatus("learning");

		AcademicCurrent saveAcademicCurrent = academicCurrentService.post(academicCurrent);
		return new ResponseEntity<>(saveAcademicCurrent, HttpStatus.CREATED);
	}

	@PutMapping("/update-status/{id}")
	public ResponseEntity<String> updateStudentStatus(@PathVariable long id,
			@RequestBody AcademicCurrentDto academicCurrentDto) {
		AcademicCurrent current = academicCurrentService.getbyid(id);

		// Move to AcademicOld
		AcademicOld old = new AcademicOld();
		old.setAcademicYear(current.getAcademicYear());
		old.setClassTeacher(current.getClassTeacher());
		old.setDivision(current.getDivision());
		old.setStudentId(current.getStudentId());
		old.setSchoolUdiseNo(current.getSchoolUdiseNo());
//		old.setStatus(academicCurrentDto.getStatus());
		old.setCreatedAt(current.getCreatedAt());

		if ("PassAndLeft".equalsIgnoreCase(academicCurrentDto.getStatus())) {
			// If the status is "left", move the student to AcademicOld and delete from
			// AcademicCurrent
			old.setStatus("PassAndLeft"); // Status set to "left"

			// Save the student in AcademicOld table
			academicOldService.post(old);

			// Remove the student record from AcademicCurrent (no need to save anything
			// back)
			academicCurrentService.deletedata(current.getId()); // Assuming you have a delete method

			return new ResponseEntity<>("Student status updated to 'left' and moved to AcademicOld.", HttpStatus.OK);
		}

		if ("Pass".equalsIgnoreCase(academicCurrentDto.getStatus())) {
			old.setStatus("Pass");

			academicOldService.post(old);
		}

		if ("fail".equalsIgnoreCase(academicCurrentDto.getStatus())) {
			old.setStatus("fail");
			academicOldService.post(old); // Move to AcademicOld as well if status is not "left"
		}

		current.setAcademicYear(academicCurrentDto.getAcademicYear());
		current.setClassTeacher(classTeacherService.getbyid(academicCurrentDto.getClassTeacher()));
		current.setStudentId(studentService.getbyid(academicCurrentDto.getStudentId()));
		current.setDivision(divisionService.getbyid(academicCurrentDto.getDivision()));
		current.setStandard(standardMasterService.getbyid(academicCurrentDto.getStandardId()));
		current.setStatus("learning");
		current.setCreatedAt(academicCurrentDto.getCreatedAt());

		System.out.println(current);
		academicCurrentService.post(current); // Save the updated record back to AcademicCurrent

		return new ResponseEntity<>("Student status updated and data moved.", HttpStatus.OK);
	}

	@PutMapping("/update-student/bulk")
	public ResponseEntity<String> promotePassedStudents(@RequestBody AcademicCurrentDto academicCurrentDto) {
	    System.out.println("Received DTO: " + academicCurrentDto);

	    for (Long id : academicCurrentDto.getStudentIds()) {
	        Optional<AcademicCurrent> optionalAcademicCurrent = academicCurrentService
	                .getAcademicCurrentByStudentAndSchool(id, academicCurrentDto.getSchoolUdiseNo());

	        if (optionalAcademicCurrent.isPresent()) {
	            AcademicCurrent academicCurrent = optionalAcademicCurrent.get();
	            System.out.println("Found academic current for student ID: " + id);

	            // Move current data to AcademicOld
	            AcademicOld old = new AcademicOld();
	            old.setAcademicYear(academicCurrent.getAcademicYear());
	            old.setClassTeacher(academicCurrent.getClassTeacher());
	            old.setDivision(academicCurrent.getDivision());
//	            old.setStandard(academicCurrent.getStandard());
	            old.setStudentId(academicCurrent.getStudentId());
	            old.setSchoolUdiseNo(academicCurrent.getSchoolUdiseNo());
	            old.setCreatedAt(academicCurrent.getCreatedAt());

	            // Handle based on status
	            String status = academicCurrentDto.getStatus();
	            if ("fail".equalsIgnoreCase(status)) {
	                old.setStatus("fail");
	                academicOldService.post(old); // Save to AcademicOld, student remains in current
	            } else if ("PassAndLeft".equalsIgnoreCase(status)) {
	                old.setStatus("PassAndLeft");
	                academicOldService.post(old); // Save to AcademicOld

	                academicCurrentService.deletedata(academicCurrent.getId()); // Delete from current
	                continue; // Skip update below
	            } else if ("Pass".equalsIgnoreCase(status)) {
	                old.setStatus("Pass");
	                academicOldService.post(old); // Save to AcademicOld and promote below
	            }

	            // Promote student: update AcademicCurrent with new details
	            academicCurrent.setAcademicYear(academicCurrentDto.getAcademicYear());
	            academicCurrent.setClassTeacher(classTeacherService.getbyid(academicCurrentDto.getClassTeacher()));
	            academicCurrent.setDivision(divisionService.getbyid(academicCurrentDto.getDivision()));
	            academicCurrent.setStandard(standardMasterService.getbyid(academicCurrentDto.getStandardId()));
	            academicCurrent.setStatus("learning");
	            academicCurrent.setCreatedAt(academicCurrentDto.getCreatedAt());

	            academicCurrentService.post(academicCurrent); // Save updated current
	        } else {
	            System.out.println("Academic current not found for student ID: " + id);
	        }
	    }

	    return new ResponseEntity<>("Selected students promoted successfully.", HttpStatus.OK);
	}

	@GetMapping("/student-school")
	public ResponseEntity<?> getAcademicCurrentByStudentAndSchool(@RequestParam("studentId") Long studentId,
			@RequestParam("schoolUdiseNo") long schoolUdiseNo) {

		Optional<AcademicCurrent> academicCurrent = academicCurrentService
				.getAcademicCurrentByStudentAndSchool(studentId, schoolUdiseNo);

		if (academicCurrent.isPresent()) {
			return ResponseEntity.ok(academicCurrent.get());
		} else {
			return ResponseEntity.notFound().build();
		}
	}

	@GetMapping("/")
	public ResponseEntity<List<AcademicCurrent>> getdata() {
		List<AcademicCurrent> academicCurrent = academicCurrentService.getdata();
		return new ResponseEntity<>(academicCurrent, HttpStatus.OK);
	}

	@GetMapping("/{id}")
	public ResponseEntity<AcademicCurrent> getbyiddata(@PathVariable long id) {
		AcademicCurrent academicCurrent = academicCurrentService.getbyid(id);
		return new ResponseEntity<>(academicCurrent, HttpStatus.OK);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletedata(@PathVariable long id) {
		academicCurrentService.deletedata(id);
		return new ResponseEntity<>(HttpStatus.OK);
	}
}
