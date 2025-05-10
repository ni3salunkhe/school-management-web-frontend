package com.api.service;

import java.util.List;

import com.api.entity.StandardMaster;

public interface StandardMasterService {
	
	public StandardMaster post(StandardMaster standardMaster);
	
	public List<StandardMaster> getdata();
	
	public StandardMaster getbyid(long id);
	
	public List<Integer> getStandardsBySchool(long udiseNo);
	
	public List<StandardMaster> getStandardAllDataBySchool(long udiseNo);
	
}
