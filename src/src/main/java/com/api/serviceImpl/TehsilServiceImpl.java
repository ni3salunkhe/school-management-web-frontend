package com.api.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.api.entity.Tehsil;
import com.api.repository.Tehsilrepository;
import com.api.service.TehsilService;

@Service
public class TehsilServiceImpl implements TehsilService{

	@Autowired
	private Tehsilrepository tehsilrepository;
	
	@Override
	public Tehsil post(Tehsil tehsil) {
		// TODO Auto-generated method stub
		return tehsilrepository.save(tehsil);
	}

	@Override
	public List<Tehsil> getdata() {
		// TODO Auto-generated method stub
		return tehsilrepository.findAll();
	}

	@Override
	public Tehsil getbyid(long id) {
		// TODO Auto-generated method stub
		return tehsilrepository.findById(id).orElse(null);
	}

	@Override
	public void deletedata(long id) {
		// TODO Auto-generated method stub
		tehsilrepository.deleteById(id);
	}
	
	
	
}
