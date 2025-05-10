package com.api.service;

import java.util.List;

import com.api.entity.Tehsil;

public interface TehsilService {
	
	public Tehsil post(Tehsil tehsil);
	
	public List<Tehsil> getdata();
	
	public Tehsil getbyid(long id);
	
	public void deletedata(long id);
	
}
