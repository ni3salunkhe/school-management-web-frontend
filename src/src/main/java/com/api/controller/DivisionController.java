package com.api.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.dto.DivisionDto;
import com.api.entity.Division;
import com.api.entity.School;
import com.api.service.DivisionService;
import com.api.service.SchoolService;

@RestController
@RequestMapping("/Division")
public class DivisionController {

	@Autowired
	private DivisionService divisionService;

	@Autowired
	private SchoolService schoolService;

	@PostMapping("/")
	public ResponseEntity<List<Division>> saveData(@RequestBody DivisionDto divisionDto) {
	    System.out.println(divisionDto.getDivisionName());

	    List<String> divisions = divisionDto.getDivisionName();
	    School school = schoolService.getbyid(divisionDto.getSchoolUdiseNo());
	    List<Division> currentDivisions = divisionService.getallbyudise(school);
	    List<Division> savedDivisions = new ArrayList<>();

	    for (String div : divisions) {
	        String trimmedDiv = div.trim();

	        // Check if division already exists
	        boolean exists = currentDivisions.stream()
	            .anyMatch(d -> d.getName().equalsIgnoreCase(trimmedDiv)); // Case-insensitive match

	        if (!exists) {
	            Division division = new Division();
	            division.setName(trimmedDiv);
	            division.setSchoolUdiseNo(school);

	            Division saved = divisionService.post(division);
	            savedDivisions.add(saved);
	        }
	    }

	    return new ResponseEntity<>(savedDivisions, HttpStatus.CREATED);
	}

	@GetMapping("/")
	public ResponseEntity<List<Division>> getdata() {
		List<Division> division = divisionService.getdata();
		return new ResponseEntity<List<Division>>(division, HttpStatus.OK);
	}

	@GetMapping("/{id}")
	public ResponseEntity<Division> getbyiddata(@PathVariable long id) {
		Division division = divisionService.getbyid(id);
		return new ResponseEntity<Division>(division, HttpStatus.OK);
	}

	@GetMapping("getbyudise/{udise}")
	public ResponseEntity<List<Division>> getalldatabyUdiseNo(@PathVariable long udise) {
		School school = schoolService.getbyid(udise);
		List<Division> divisions = divisionService.getallbyudise(school);
		return new ResponseEntity<List<Division>>(divisions, HttpStatus.OK);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletedata(@PathVariable long id) {
		divisionService.deletedata(id);
		return new ResponseEntity<Void>(HttpStatus.OK);
	}

}
