package com.api.service;

import java.util.List;

import com.api.entity.School;

public interface SchoolService {
	
	public School post(School school);
	
	public List<School> getdata();
	
	public School getbyid(long id);
	
	public void deletedata(long id);
	
	public School getByUsername(String username);
	
}
