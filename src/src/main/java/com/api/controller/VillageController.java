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

import com.api.dto.VillageDto;
import com.api.entity.Village;
import com.api.service.TehsilService;
import com.api.service.VillageService;

@RestController
@RequestMapping("/village")
public class VillageController {

	@Autowired
	private VillageService villageService;
	
	@Autowired
	private TehsilService tehsilService;
	
	@PostMapping("/")
	public ResponseEntity<Village> savedata(@RequestBody VillageDto villageDto)
	{
		Village village=new Village();
		
		village.setVillageName(villageDto.getVillageName());
		village.setTehsil(tehsilService.getbyid(villageDto.getTehsilid()));
		
		Village saveVillage=villageService.post(village);
		
		return new ResponseEntity<Village>(saveVillage,HttpStatus.CREATED);
	}
	
	@GetMapping("/")
	public ResponseEntity<List<Village>> getalldata()
	{
		List<Village> village=villageService.getdata();
		
		return new ResponseEntity<List<Village>>(village,HttpStatus.OK);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<Village> getbyid(@PathVariable long id)
	{
		Village village=villageService.getbyid(id);
		return new ResponseEntity<Village>(village,HttpStatus.OK);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<Village> editdata(@PathVariable long id,@RequestBody VillageDto villageDto)
	{
		Village village=villageService.getbyid(id);
		
		if(village==null)
		{
			return new ResponseEntity<Village>(HttpStatus.NOT_FOUND);
		}
		
		else {
			village.setVillageName(villageDto.getVillageName());
			village.setTehsil(tehsilService.getbyid(villageDto.getTehsilid()));
			
			Village saveVillage=villageService.post(village);
			
			return new ResponseEntity<Village>(saveVillage,HttpStatus.CREATED);
		}
		
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<Village> deletedata(@PathVariable long id)
	{
		villageService.deletedata(id);
		return new ResponseEntity<Village>(HttpStatus.OK);
	}
	
}
