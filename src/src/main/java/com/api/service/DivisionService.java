package com.api.service;

import java.util.List;
import java.util.Optional;

import com.api.entity.Division;
import com.api.entity.School;

public interface DivisionService {
	
	public Division post(Division division);
	
	public List<Division> getdata();
	
	public Division getbyid(long id);
	
	public void deletedata(long id);
	
	Optional<Division> findbyname(String name);
	
	public List<Division> getallbyudise(School school);
	
}
