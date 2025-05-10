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
import org.springframework.web.bind.annotation.RestController;

import com.api.dto.HolidayDto;
import com.api.entity.Holiday;
import com.api.entity.School;
import com.api.service.HolidayService;
import com.api.service.SchoolService;
import com.api.service.StaffService;
@RestController("/holiday")
public class HolidayController {
	
	@Autowired
	private HolidayService holidayService;
	
	@Autowired
	private StaffService staffService;
	
	@Autowired
	private SchoolService schoolService;
	
	@GetMapping("/")
	public ResponseEntity<List<Holiday>> getalldata()
	{
		List<Holiday> getalldata=holidayService.getallData();
		return new ResponseEntity<List<Holiday>>(getalldata,HttpStatus.OK);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<Holiday> getbyidData(@PathVariable long id)
	{
		Holiday holiday=holidayService.getbyid(id);
		return new ResponseEntity<Holiday>(holiday,HttpStatus.OK);
	}
	
	@PostMapping("/")
	public ResponseEntity<Holiday> postData(@PathVariable HolidayDto holidayDto )
	{
		Holiday holiday=new Holiday();
		
		holiday.setHolidayDate(holidayDto.getHolidayDate());
		holiday.setReason(holidayDto.getReason());
		holiday.setCreatedBy(staffService.getbyid(holidayDto.getCreatedBy()));
		holiday.setUdise(schoolService.getbyid(holidayDto.getUdise()));
		Holiday saveHoliday=holidayService.saveData(holiday);
		
		return new ResponseEntity<Holiday>(saveHoliday,HttpStatus.OK);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<Holiday> putData(@PathVariable long id,@RequestBody HolidayDto holidayDto)
	{
		Holiday holiday=holidayService.getbyid(id);
		
		holiday.setHolidayDate(holidayDto.getHolidayDate());
		holiday.setReason(holidayDto.getReason());
		holiday.setCreatedBy(staffService.getbyid(holidayDto.getCreatedBy()));
		holiday.setUdise(schoolService.getbyid(holidayDto.getUdise()));
		Holiday saveHoliday=holidayService.saveData(holiday);
		
		return new ResponseEntity<Holiday>(saveHoliday,HttpStatus.OK);
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteData(@PathVariable long id)
	{
		holidayService.deleteData(id);
		
		return new ResponseEntity<Void>(HttpStatus.OK);
	}
}
