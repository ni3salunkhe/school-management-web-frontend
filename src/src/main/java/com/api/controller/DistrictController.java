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

import com.api.dto.DistrictDto;
import com.api.entity.District;
import com.api.service.DistrictService;
import com.api.service.StateService;

@RestController
@RequestMapping("/district")
public class DistrictController {
	
	@Autowired
	private DistrictService districtService;
	
	@Autowired
	private StateService stateService;
	
	@PostMapping("/")
	public ResponseEntity<District> savedata(@RequestBody DistrictDto districtDto)
	{
		District district=new District();
		
		district.setDistrictName(districtDto.getDistrictName());
		district.setState(stateService.getbyid(districtDto.getStateid()));
		
		District saveDistrict=districtService.post(district);
		
		return new ResponseEntity<District>(saveDistrict,HttpStatus.CREATED);
	}
	
	@GetMapping("/")
	public ResponseEntity<List<District>> getalldata()
	{
		List<District> district=districtService.getdata();
		
		return new ResponseEntity<List<District>>(district,HttpStatus.OK);
	}
	
	
	@GetMapping("/{id}")
	public ResponseEntity<District> getbyid(@PathVariable long id)
	{
		District district=districtService.getbyid(id);
		return new ResponseEntity<District>(district,HttpStatus.OK);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<District> editdata(@PathVariable long id ,@RequestBody DistrictDto districtDto)
	{
		District district=districtService.getbyid(id);
		
		if(district==null)
		{
			return new ResponseEntity<District>(HttpStatus.NOT_FOUND);
		}
		else {
			district.setDistrictName(districtDto.getDistrictName());
			district.setState(stateService.getbyid(districtDto.getStateid()));
			
			District saveDistrict=districtService.post(district);
			
			return new ResponseEntity<District>(saveDistrict,HttpStatus.CREATED);
		}
		
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletedata(@PathVariable long id)
	{
		districtService.deletedata(id);
		return new ResponseEntity<Void>(HttpStatus.OK);
	}
	
	
}
