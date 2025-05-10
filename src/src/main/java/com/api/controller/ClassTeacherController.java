package com.api.controller;

import java.util.List;

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
import org.springframework.web.bind.annotation.RestController;

import com.api.dto.ClassTeacherDto;
import com.api.entity.ClassTeacher;
import com.api.entity.School;
import com.api.entity.Staff;
import com.api.service.ClassTeacherService;
import com.api.service.DivisionService;
import com.api.service.SchoolService;
import com.api.service.StaffService;
import com.api.service.StandardMasterService;

@RestController
@RequestMapping("/classteacher")
public class ClassTeacherController {
	
	@Autowired
	private DivisionService divisionService;
	
	@Autowired
	private StandardMasterService standardMasterService;
	
	@Autowired
	private StaffService staffService;
	
	@Autowired
	private ClassTeacherService classTeacherService;
	
	@Autowired
	private SchoolService schoolService;
	
	@PostMapping("/")
	public ResponseEntity<ClassTeacher> savedata(@RequestBody ClassTeacherDto classTeacherDto)
	{
		
		ClassTeacher classTeacher=new ClassTeacher();
		
		classTeacher.setDivision(divisionService.getbyid(classTeacherDto.getDivision()));
		classTeacher.setStaff(staffService.getbyid(classTeacherDto.getStaff()));
		classTeacher.setStandardMaster(standardMasterService.getbyid(classTeacherDto.getStandardMaster()));
		classTeacher.setSchoolUdiseNo(schoolService.getbyid(classTeacherDto.getSchoolUdiseNo()));
		
		ClassTeacher saveClassTeacher= classTeacherService.post(classTeacher);
		return new ResponseEntity<ClassTeacher>(saveClassTeacher,HttpStatus.CREATED);
	}
	
	@PutMapping("/editclassteacher/{id}")
	public ResponseEntity<ClassTeacher> editclassteacher(@PathVariable long id,@RequestBody ClassTeacherDto classTeacherDto)
	{
		ClassTeacher classTeacher=classTeacherService.getbyid(id);
		
		classTeacher.setStaff(staffService.getbyid(classTeacherDto.getStaff()));
		
		ClassTeacher saveClassTeacher=classTeacherService.post(classTeacher);
		
		return new ResponseEntity<ClassTeacher>(saveClassTeacher,HttpStatus.OK);
	}
	
	// Reserved staff (not assigned to any class)
	@GetMapping("/reservedstaff")
	public ResponseEntity<List<Staff>> getReservedStaff() {
	    List<Staff> reservedStaffs = staffService.getUnassignedStaff();
	    return new ResponseEntity<>(reservedStaffs, HttpStatus.OK);
	}

	// All class-teacher assignments
	@GetMapping("/")
	public ResponseEntity<List<ClassTeacher>> getdata() {
	    List<ClassTeacher> classTeacher = classTeacherService.getdata();
	    return new ResponseEntity<>(classTeacher, HttpStatus.OK);
	}

	// Get by ID (specific assignment)
	@GetMapping("/getbyid/{id}")
	public ResponseEntity<ClassTeacher> getbyiddata(@PathVariable long id) {
	    ClassTeacher classTeacher = classTeacherService.getByStaffId(id);
	    return new ResponseEntity<>(classTeacher, HttpStatus.OK);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<ClassTeacher> getbyclassTeacherId(@PathVariable long id)
	{
		ClassTeacher classTeacher=classTeacherService.getbyid(id);
		return new ResponseEntity<ClassTeacher>(classTeacher,HttpStatus.OK);
	}
	
	
	@GetMapping("/getbyudise/{udiseNo}")
	public ResponseEntity<List<ClassTeacher>> getalldatabyudiseNo(@PathVariable long udiseNo)
	{
		School school=schoolService.getbyid(udiseNo);
		List<ClassTeacher> classTeacher=classTeacherService.getbyudise(school);
		return new ResponseEntity<List<ClassTeacher>>(classTeacher,HttpStatus.OK);
	}

	
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletedata(@PathVariable long id)
	{
		classTeacherService.deletedata(id);
		return new ResponseEntity<Void>(HttpStatus.OK);
	}
}
