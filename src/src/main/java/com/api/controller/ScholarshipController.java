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

import com.api.dto.ScholarshipDto;
import com.api.entity.Scholarship;
import com.api.service.ScholarshipService;
import com.api.service.StudentService;

@RestController
@RequestMapping("/scholarship")
public class ScholarshipController {
	
	@Autowired
	private ScholarshipService scholarshipService;
	
	@Autowired
	private StudentService studentService;
	
	@PostMapping("/")
	public ResponseEntity<Scholarship> savedata(@RequestBody ScholarshipDto scholarshipDto)
	{
		Scholarship scholarship=new Scholarship();
		scholarship.setStudentRegisterId(studentService.getbyid(scholarshipDto.getStudentRegisterId()));
		scholarship.setFatherFullName(scholarshipDto.getFatherFullName());
		scholarship.setNameOfEligibleScholarship(scholarshipDto.getNameOfEligibleScholarship());
		scholarship.setCreatedAt(scholarshipDto.getCreatedAt());
		
		Scholarship saveScholarship=scholarshipService.post(scholarship);
		
		return new ResponseEntity<Scholarship>(saveScholarship,HttpStatus.CREATED);
		
	}
	
	@GetMapping("/")
	public ResponseEntity<List<Scholarship>> getdata()
	{
		List<Scholarship> scholarship=scholarshipService.getdata();
		return new ResponseEntity<List<Scholarship>>(scholarship,HttpStatus.OK);
	}
	
	
	@GetMapping("/{id}")
	public ResponseEntity<Scholarship> getbyidata(@PathVariable long id)
	{
		Scholarship scholarship=scholarshipService.getbyid(id);
		return new ResponseEntity<Scholarship>(scholarship,HttpStatus.OK);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<Scholarship> editdata(@PathVariable long id,@RequestBody ScholarshipDto scholarshipDto)
	{
		Scholarship scholarship=scholarshipService.getbyid(id);
		if(scholarship==null)
		{
			return new ResponseEntity<Scholarship>(HttpStatus.NOT_FOUND);
		}
		else {
			scholarship.setStudentRegisterId(studentService.getbyid(scholarshipDto.getStudentRegisterId()));
			scholarship.setFatherFullName(scholarshipDto.getFatherFullName());
			scholarship.setNameOfEligibleScholarship(scholarshipDto.getNameOfEligibleScholarship());
			scholarship.setCreatedAt(scholarshipDto.getCreatedAt());
			
			Scholarship saveScholarship=scholarshipService.post(scholarship);
			
			return new ResponseEntity<Scholarship>(saveScholarship,HttpStatus.CREATED);
		}
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletedatabyid(@PathVariable long id)
	{
		scholarshipService.deletedata(id);
		return new ResponseEntity<Void>(HttpStatus.OK);
	}
}
