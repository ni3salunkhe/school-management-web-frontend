package com.api.service;

import java.util.List;

import com.api.entity.School;
import com.api.entity.Staff;

public interface StaffService {
	
	public Staff post(Staff staff);
	
	public List<Staff> getdata();
	
	public Staff getbyid(long id);
	
	public void deletedata(long id);

	public List<Staff> getUnassignedStaff();
	
	public List<Staff> getaAllDataByUdise(long udiseNo);
	
	public Staff getByUsername(String username);
	
	public Staff getByUsernameAndUdise(long udiseNo,String username);
}
