package com.api.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.api.dto.StudentDto;
import com.api.entity.AcademicCurrent;
import com.api.entity.ClassTeacher;
import com.api.entity.School;
import com.api.entity.Student;
import com.api.service.AcademicCurrentService;
import com.api.service.ClassTeacherService;
import com.api.service.DistrictService;
import com.api.service.SchoolService;
import com.api.service.StandardMasterService;
import com.api.service.StateService;
import com.api.service.StudentService;
import com.api.service.TehsilService;
import com.api.service.VillageService;

@RestController
@RequestMapping("/student")
public class StudentController {

	@Autowired
	private StudentService studentService;

	@Autowired
	private SchoolService schoolService;

	@Autowired
	private StateService stateService;

	@Autowired
	private DistrictService districtService;

	@Autowired
	private TehsilService tehsilService;

	@Autowired
	private VillageService villageService;

	@Autowired
	private ClassTeacherService classTeacherService;

	@Autowired
	private AcademicCurrentService academicCurrentService;
	
	@Autowired
	private StandardMasterService standardMasterService;

	@PostMapping("/")
	public ResponseEntity<Student> savedata(@RequestBody StudentDto studentDto) {
		Student student = new Student();

		student.setRegisterNumber(studentDto.getRegisterNumber());
		student.setSchool(schoolService.getbyid(studentDto.getSchool()));
		student.setApparId(studentDto.getApparId());
		student.setStudentId(studentDto.getStudentId());
		student.setAdhaarNumber(studentDto.getAdhaarNumber());
		student.setGender(studentDto.getGender());
		student.setSurName(studentDto.getSurName());
		student.setStudentName(studentDto.getStudentName());
		student.setFatherName(studentDto.getFatherName());
		student.setMotherName(studentDto.getMotherName());
		student.setNationality(studentDto.getNationality());
		student.setMotherTongue(studentDto.getMotherTongue());
		student.setReligion(studentDto.getReligion());
		student.setCaste(studentDto.getCaste());
		student.setSubCast(studentDto.getSubCast());
		student.setVillageOfBirth(villageService.getbyid(studentDto.getVillageOfBirth()));
		student.setTehasilOfBirth(tehsilService.getbyid(studentDto.getTehasilOfBirth()));
		student.setDistrictOfBirth(districtService.getbyid(studentDto.getDistrictOfBirth()));
		student.setStateOfBirth(stateService.getbyid(studentDto.getStateOfBirth()));
		student.setDateOfBirth(studentDto.getDateOfBirth());
		student.setDateOfBirthInWord(studentDto.getDateOfBirthInWord());
		student.setLastSchoolUdiseNo(studentDto.getLastSchoolUdiseNo());
		student.setAdmissionDate(studentDto.getAdmissionDate());
		student.setWhichStandardAdmitted(standardMasterService.getbyid(studentDto.getWhichStandardAdmitted()));
		student.setCreatedAt(studentDto.getCreatedAt());
		student.setBirthPlace(studentDto.getBirthPlace());
		student.setCasteCategory(studentDto.getCasteCategory());
		student.setEbcInformation(studentDto.getEbcInformation());
		student.setMinorityInformation(studentDto.getMinorityInformation());
		student.setMobileNo(studentDto.getMobileNo());
		student.setResidentialAddress(studentDto.getResidentialAddress());

		Student saveStudent = studentService.post(student);

		return new ResponseEntity<Student>(saveStudent, HttpStatus.OK);
	}

	@GetMapping("/")
	public ResponseEntity<List<Student>> getdata() {
		List<Student> student = studentService.getdata();
		return new ResponseEntity<List<Student>>(student, HttpStatus.OK);
	}

	@GetMapping("/{id}")
	public ResponseEntity<Student> getbyid(@PathVariable long id) {
		Student student = studentService.getbyid(id);
		return new ResponseEntity<Student>(student, HttpStatus.OK);
	}

	@GetMapping("/byudise/{udise}")
	public ResponseEntity<List<Student>> getbyUdiseOnly(@PathVariable long udise) {
		List<Student> students = studentService.getAllDataByudise(udise);
		return new ResponseEntity<List<Student>>(students, HttpStatus.OK);
	}

	@GetMapping("/search")
	public ResponseEntity<List<Student>> searchStudents(@RequestParam(required = false) String surName,
			@RequestParam(required = false) String studentName, @RequestParam(required = false) String fatherName,
			@RequestParam(required = false) String motherName, @RequestParam Long udise) {

		List<Student> students = studentService.getUnassignedStudents(udise);
		List<Student> filteredStudents = new ArrayList<>();

		for (Student student : students) {
			boolean matches = true;

			if (surName != null && !student.getSurName().toLowerCase().contains(surName.toLowerCase())) {
				matches = false;
			}
			if (studentName != null && !student.getStudentName().toLowerCase().contains(studentName.toLowerCase())) {
				matches = false;
			}
			if (fatherName != null && !student.getFatherName().toLowerCase().contains(fatherName.toLowerCase())) {
				matches = false;
			}
			if (motherName != null && !student.getMotherName().toLowerCase().contains(motherName.toLowerCase())) {
				matches = false;
			}

			if (matches) {
				filteredStudents.add(student);
			}
		}

		return ResponseEntity.ok(filteredStudents);
	}

	@GetMapping("/unassigned")
	public ResponseEntity<List<Student>> getUnassignedStudents(@RequestParam long udise) {
		List<Student> students = studentService.getUnassignedStudents(udise);
		return ResponseEntity.ok(students);
	}

	@PutMapping("/{id}")
	public ResponseEntity<Student> editdata(@PathVariable long id, @RequestBody StudentDto studentDto) {
		Student student = studentService.getbyid(id);
		if (student == null) {
			return new ResponseEntity<Student>(HttpStatus.NOT_FOUND);
		}

		else {
			student.setRegisterNumber(studentDto.getRegisterNumber());
			student.setSchool(schoolService.getbyid(studentDto.getSchool()));
			student.setApparId(studentDto.getApparId());
			student.setStudentId(studentDto.getStudentId());
			student.setAdhaarNumber(studentDto.getAdhaarNumber());
			student.setGender(studentDto.getGender());
			student.setSurName(studentDto.getSurName());
			student.setStudentName(studentDto.getStudentName());
			student.setFatherName(studentDto.getFatherName());
			student.setMotherName(studentDto.getMotherName());
			student.setNationality(studentDto.getNationality());
			student.setMotherTongue(studentDto.getMotherTongue());
			student.setReligion(studentDto.getReligion());
			student.setCaste(studentDto.getCaste());
			student.setSubCast(studentDto.getSubCast());
			student.setVillageOfBirth(villageService.getbyid(studentDto.getVillageOfBirth()));
			student.setTehasilOfBirth(tehsilService.getbyid(studentDto.getTehasilOfBirth()));
			student.setDistrictOfBirth(districtService.getbyid(studentDto.getDistrictOfBirth()));
			student.setStateOfBirth(stateService.getbyid(studentDto.getStateOfBirth()));
			student.setDateOfBirth(studentDto.getDateOfBirth());
			student.setDateOfBirthInWord(studentDto.getDateOfBirthInWord());
			student.setLastSchoolUdiseNo(studentDto.getLastSchoolUdiseNo());
			student.setAdmissionDate(studentDto.getAdmissionDate());
			student.setWhichStandardAdmitted(standardMasterService.getbyid(studentDto.getWhichStandardAdmitted()));
			student.setCreatedAt(studentDto.getCreatedAt());
			student.setBirthPlace(studentDto.getBirthPlace());
			student.setCasteCategory(studentDto.getCasteCategory());
			student.setEbcInformation(studentDto.getEbcInformation());
			student.setMinorityInformation(studentDto.getMinorityInformation());
			student.setMobileNo(studentDto.getMobileNo());
			student.setResidentialAddress(studentDto.getResidentialAddress());

			Student saveStudent = studentService.post(student);

			return new ResponseEntity<Student>(saveStudent, HttpStatus.OK);

		}
	}

	@GetMapping("/byclass/{teacherId}")
	public ResponseEntity<List<Student>> getallStudentsByClass(@PathVariable("teacherId") long teacherId) {
		ClassTeacher classTeacher = classTeacherService.getByStaffId(teacherId);

		List<AcademicCurrent> academicCurrents = academicCurrentService.getByClassTeacheId(classTeacher.getId());

		ArrayList<Student> students = new ArrayList<Student>();

		List<Student> studentss = studentService.getdata();

		for (Student student : studentss) {
			for (AcademicCurrent academicCurrent : academicCurrents) {
				if (student.getId() == academicCurrent.getStudentId().getId()) {
					students.add(student);
				}
			}

		}

		return new ResponseEntity<List<Student>>(students, HttpStatus.OK);
	}

	@GetMapping("/byclass/search/{teacherId}")
	public ResponseEntity<List<Student>> getFilteredStudentsByClassTeacher(
	        @PathVariable long teacherId,
	        @RequestParam(required = false) String surName,
	        @RequestParam(required = false) String studentName,
	        @RequestParam(required = false) String fatherName,
	        @RequestParam(required = false) String motherName,
	        @RequestParam long udise) {

	    ClassTeacher classTeacher = classTeacherService.getByStaffId(teacherId);
	    List<AcademicCurrent> academicCurrents = academicCurrentService.getByClassTeacheId(classTeacher.getId());
	    List<Student> allStudents = studentService.getdata();
	    List<Student> students = new ArrayList<>();

	    for (Student student : allStudents) {
	        for (AcademicCurrent academicCurrent : academicCurrents) {
	            if (student.getId() == academicCurrent.getStudentId().getId()) {
	                students.add(student);
	                break;
	            }
	        }
	    }

	    // Filter the students by search parameters
	    List<Student> filteredStudents = new ArrayList<>();
	    for (Student student : students) {
	        boolean matches = true;

	        if (surName != null && !student.getSurName().toLowerCase().contains(surName.toLowerCase())) {
	            matches = false;
	        }
	        if (studentName != null && !student.getStudentName().toLowerCase().contains(studentName.toLowerCase())) {
	            matches = false;
	        }
	        if (fatherName != null && !student.getFatherName().toLowerCase().contains(fatherName.toLowerCase())) {
	            matches = false;
	        }
	        if (motherName != null && !student.getMotherName().toLowerCase().contains(motherName.toLowerCase())) {
	            matches = false;
	        }

	        if (matches) {
	            filteredStudents.add(student);
	        }
	    }

	    return new ResponseEntity<>(filteredStudents, HttpStatus.OK);
	}
	
	
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletedata(@PathVariable long id) {
		studentService.deletedata(id);
		return new ResponseEntity<Void>(HttpStatus.OK);
	}
	
	@GetMapping("/school/{udiseNo}")
	public ResponseEntity<?> getStudentsBySchool(@PathVariable long udiseNo) {
		List<Student> students = studentService.getStudentsBySchool(udiseNo);
		if (students.isEmpty()) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(students);
	}
	
}
