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

import com.api.dto.StateDto;
import com.api.entity.State;
import com.api.service.StateService;

@RestController
@RequestMapping("/state")
public class StateController {
	
	@Autowired
	private StateService stateService;
	
	@PostMapping("/")
	public ResponseEntity<State> savedata(@RequestBody StateDto stateDto)
	{
		State state=new State();
		
		state.setStateName(stateDto.getStateName());
		
		State saveState=stateService.post(state);
		
		return new ResponseEntity<State>(saveState,HttpStatus.CREATED);
	}
	
	@GetMapping("/")
	public ResponseEntity<List<State>> getalldata()
	{
		List<State> state=stateService.getdata();
		
		return new ResponseEntity<List<State>>(state,HttpStatus.OK);
	}
	
	
	@GetMapping("/{id}")
	public ResponseEntity<State> getbyid(@PathVariable long id)
	{
		State state=stateService.getbyid(id);
		return new ResponseEntity<State>(state,HttpStatus.OK);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<State> editdata(@PathVariable long id ,@RequestBody StateDto stateDto)
	{
		State state=stateService.getbyid(id);
		
		if(state==null)
		{
			return new ResponseEntity<State>(HttpStatus.NOT_FOUND);
		}
		else {
			state.setStateName(stateDto.getStateName());
			State saveState=stateService.post(state);
			return new ResponseEntity<State>(saveState,HttpStatus.CREATED);
		}
		
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletedata(@PathVariable long id)
	{
		stateService.deletedata(id);
		return new ResponseEntity<Void>(HttpStatus.OK);
	}
	
}
