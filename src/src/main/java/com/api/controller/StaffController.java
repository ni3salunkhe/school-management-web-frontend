package com.api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.dto.StaffDto;
import com.api.entity.School;
import com.api.entity.Staff;
import com.api.service.SchoolService;
import com.api.service.StaffService;

@RestController
@RequestMapping("/staff")
public class StaffController {
	
	@Autowired
	private StaffService staffService;
	
	@Autowired
	private SchoolService schoolService;
	
	@Autowired
	PasswordEncoder passwordEncoder;
	
	@PostMapping("/")
	public ResponseEntity<Staff> savedata(@RequestBody StaffDto staffDto)
	{
		Staff staff=new Staff();
		
		staff.setFname(staffDto.getFname());
		staff.setFathername(staffDto.getFathername());
		staff.setLname(staffDto.getLname());
		staff.setUsername(staffDto.getUsername());
		staff.setEmail(staffDto.getEmail());
		staff.setMobile(staffDto.getMobile());
		staff.setPassword(passwordEncoder.encode(staffDto.getPassword()));
		staff.setStandard(staffDto.getStandard());
		staff.setRole(staffDto.getRole());
		staff.setLevel(staffDto.getLevel());
		staff.setSchool(schoolService.getbyid(staffDto.getSchool()));
		staff.setStatus(staffDto.getStatus());
		staff.setCreatedAt(staffDto.getCreatedAt());
		
		Staff saveStaff=staffService.post(staff);
		
		
		return new ResponseEntity<Staff>(saveStaff,HttpStatus.CREATED);
	}
	
	@GetMapping("/")
	public ResponseEntity<List<Staff>> getalldata()
	{
		List<Staff> staff=staffService.getdata();
		
		return new ResponseEntity<List<Staff>>(staff,HttpStatus.OK);
	}
	
	
	@GetMapping("/{id}")
	public ResponseEntity<Staff> getbyid(@PathVariable long id)
	{
		Staff staff=staffService.getbyid(id);
		return new ResponseEntity<Staff>(staff,HttpStatus.OK);
	}
	
	@GetMapping("/getbyudise/{udiseNo}")
	public ResponseEntity<List<Staff>> getByUdiseNumber(@PathVariable long udiseNo)
	{
		List<Staff> staff=staffService.getaAllDataByUdise(udiseNo);
		return new ResponseEntity<List<Staff>>(staff,HttpStatus.OK);
	}
	
	@GetMapping("/getbyudiseandusername/{udise}/{username}")
	public ResponseEntity<Staff> getByUdiseAndUsername(@PathVariable long udise,@PathVariable String username)
	{
		Staff staff=staffService.getByUsernameAndUdise(udise, username);
		return new ResponseEntity<Staff>(staff,HttpStatus.OK);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<Staff> editdata(@PathVariable long id ,@RequestBody StaffDto staffDto)
	{
		Staff staff=staffService.getbyid(id);
		
		if(staff==null)
		{
			return new ResponseEntity<Staff>(HttpStatus.NOT_FOUND);
		}
		else {
			staff.setFname(staffDto.getFname());
			staff.setFathername(staffDto.getFathername());
			staff.setLname(staffDto.getLname());
			staff.setUsername(staffDto.getUsername());
			staff.setEmail(staffDto.getEmail());
			staff.setMobile(staffDto.getMobile());
			staff.setPassword(passwordEncoder.encode(staffDto.getPassword()));
			staff.setStandard(staffDto.getStandard());
			staff.setRole(staffDto.getRole());
			staff.setLevel(staffDto.getLevel());
			staff.setSchool(schoolService.getbyid(staffDto.getSchool()));
			staff.setStatus(staffDto.getStatus());
			staff.setCreatedAt(staffDto.getCreatedAt());
			
			Staff saveStaff=staffService.post(staff);
			
			
			return new ResponseEntity<Staff>(saveStaff,HttpStatus.CREATED);
		}
		
	}
	
	@GetMapping("/status/{id}")
	public ResponseEntity<Staff> updateStatus (@PathVariable long id)
	{
		Staff staff=staffService.getbyid(id);
		staff.setStatus("left");		
		Staff saveStaff=staffService.post(staff);
		return new ResponseEntity<Staff>(saveStaff,HttpStatus.OK);
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletedata(@PathVariable long id)
	{
		staffService.deletedata(id);
		return new ResponseEntity<Void>(HttpStatus.OK);
	}

	
}
