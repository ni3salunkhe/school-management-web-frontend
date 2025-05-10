package com.api.service;

import java.util.List;

import com.api.entity.State;

public interface StateService {
	
	public State post(State state);
	
	public List<State> getdata();
	
	public State getbyid(long id);
	
	public void deletedata(long id);
	
}
