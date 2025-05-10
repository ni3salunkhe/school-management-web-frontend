package com.api.service;

import java.util.List;

import com.api.entity.Holiday;

public interface HolidayService {

	public List<Holiday> getallData();
	
	public Holiday saveData(Holiday holiday);
	
	public Holiday getbyid(long id);
	
	public void deleteData(long id);
	
}
