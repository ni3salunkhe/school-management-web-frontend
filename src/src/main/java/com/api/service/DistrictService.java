package com.api.service;

import java.util.List;

import com.api.entity.District;

public interface DistrictService {
	
	public District post(District district);
	
	public List<District> getdata();
	
	public District getbyid(long id);
	
	public void deletedata(long id);
	
}
