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


import com.api.dto.TehsilDto;
import com.api.entity.Tehsil;
import com.api.service.DistrictService;
import com.api.service.TehsilService;

@RestController
@RequestMapping("/tehsil")
public class TehsilController {
	
	@Autowired
	private TehsilService tehsilService;
	
	@Autowired
	private DistrictService districtService;
	
	@PostMapping("/")
	public ResponseEntity<Tehsil> savedata(@RequestBody TehsilDto tehsilDto )
	{
		Tehsil tehsil=new Tehsil();
		
		tehsil.setTehsilName(tehsilDto.getTehsilName());
		tehsil.setDistrict(districtService.getbyid(tehsilDto.getDistrict()));
		
		Tehsil saveTehsil=tehsilService.post(tehsil);
		
		return new ResponseEntity<Tehsil>(saveTehsil,HttpStatus.CREATED);
	}
	
	@GetMapping("/")
	public ResponseEntity<List<Tehsil>> getalldata()
	{
		List<Tehsil> tehsil=tehsilService.getdata();
		
		return new ResponseEntity<List<Tehsil>>(tehsil,HttpStatus.OK);
	}
	
	
	@GetMapping("/{id}")
	public ResponseEntity<Tehsil> getbyid(@PathVariable long id)
	{
		Tehsil tehsil=tehsilService.getbyid(id);
		return new ResponseEntity<Tehsil>(tehsil,HttpStatus.OK);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<Tehsil> editdata(@PathVariable long id ,@RequestBody TehsilDto tehsilDto)
	{
		Tehsil tehsil=tehsilService.getbyid(id);
		
		if(tehsil==null)
		{
			return new ResponseEntity<Tehsil>(HttpStatus.NOT_FOUND);
		}
		else {
			tehsil.setTehsilName(tehsilDto.getTehsilName());
			tehsil.setDistrict(districtService.getbyid(tehsilDto.getDistrict()));
			
			Tehsil saveTehsil=tehsilService.post(tehsil);
			
			return new ResponseEntity<Tehsil>(saveTehsil,HttpStatus.CREATED);
		}
		
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletedata(@PathVariable long id)
	{
		tehsilService.deletedata(id);
		return new ResponseEntity<Void>(HttpStatus.OK);
	}
	
}
