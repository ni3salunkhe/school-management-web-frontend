package com.api.controller;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.dto.StandardMasterDto;
import com.api.entity.School;
import com.api.entity.StandardMaster;
import com.api.service.SchoolService;
import com.api.service.StandardMasterService;

@RestController
@RequestMapping("/standardmaster")
public class StandardMasterController {

	@Autowired
	private StandardMasterService standardMasterService;

	@Autowired
	private SchoolService schoolService;

	@PostMapping("/")
	public ResponseEntity<StandardMaster> savedata(@RequestBody StandardMasterDto standardMasterDto) {
		List<StandardMaster> savedStandards = new ArrayList<>();

		School school = schoolService.getbyid(standardMasterDto.getUdiseNo());

		List<Integer> existingStandards = standardMasterService.getStandardsBySchool(school.getUdiseNo());

		List<Integer> allStandards = IntStream
				.rangeClosed(standardMasterDto.getLowerClass(), standardMasterDto.getUpperClass()).boxed()
				.collect(Collectors.toList());

		List<Integer> missingStandards = allStandards.stream().filter(s -> !existingStandards.contains(s))
				.collect(Collectors.toList());

//		for (int i = standardMasterDto.getLowerClass(); i <= standardMasterDto.getUpperClass(); i++) {
//			System.out.println(i);
//			StandardMaster standardMaster = new StandardMaster();
//			standardMaster.setSchoolUdiseNo(schoolService.getbyid(standardMasterDto.getUdiseNo()));
//			standardMaster.setStandard(i);
//			StandardMaster saveStandardMaster = standardMasterService.post(standardMaster);
//			savedStandards.add(saveStandardMaster);
//		}
		
		for(Integer standard:missingStandards)
		{
			StandardMaster standardMaster=new StandardMaster();
			standardMaster.setSchoolUdiseNo(school);
			standardMaster.setStandard(standard);
			
			StandardMaster saveStandardMaster=standardMasterService.post(standardMaster);
			savedStandards.add(saveStandardMaster);
			
		}
			
			
		return new ResponseEntity<StandardMaster>(HttpStatus.CREATED);

	}
	
	@GetMapping("/")
	public ResponseEntity<List<StandardMaster>> getalldata()
	{
		List<StandardMaster> standardMaster=standardMasterService.getdata();
		
		return new ResponseEntity<List<StandardMaster>>(standardMaster,HttpStatus.OK);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<StandardMaster> getbyiddata(@PathVariable long id)
	{
		StandardMaster standardMaster=standardMasterService.getbyid(id);
		
		return new ResponseEntity<StandardMaster>(standardMaster,HttpStatus.OK);
	}

	@GetMapping("getbyudise/{udiseNo}")
	public ResponseEntity<List<StandardMaster>> getbyUdiseAllStandard(@PathVariable long udiseNo)
	{
		List<StandardMaster> standardMaster=standardMasterService.getStandardAllDataBySchool(udiseNo);
		
		return new ResponseEntity<List<StandardMaster>>(standardMaster,HttpStatus.OK);
	}
	
}
