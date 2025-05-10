package com.api.service;

import java.util.List;

import com.api.entity.Village;

public interface VillageService {
	
	public Village post(Village village);
	
	public List<Village> getdata();
	
	public Village getbyid(long id);
	
	public void deletedata(long id);
	
}
