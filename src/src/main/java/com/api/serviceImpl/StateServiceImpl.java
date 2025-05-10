package com.api.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.api.entity.State;
import com.api.repository.StateRepository;
import com.api.service.StateService;

@Service
public class StateServiceImpl implements StateService{

	@Autowired
	private StateRepository stateRepository;
	
	@Override
	public State post(State state) {
		// TODO Auto-generated method stub
		return stateRepository.save(state);
	}

	@Override
	public List<State> getdata() {
		// TODO Auto-generated method stub
		return stateRepository.findAll();
	}

	@Override
	public State getbyid(long id) {
		// TODO Auto-generated method stub
		return stateRepository.findById(id).orElse(null);
	}

	@Override
	public void deletedata(long id) {
		// TODO Auto-generated method stub
		stateRepository.deleteById(id);
		
	}

}
