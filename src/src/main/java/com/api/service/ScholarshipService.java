package com.api.service;

import java.util.List;

import com.api.entity.Scholarship;

public interface ScholarshipService {
	
	public Scholarship post(Scholarship scholarship);
	
	public List<Scholarship> getdata();
	
	public Scholarship getbyid(long id);
	
	public void deletedata(long id);
	
}
