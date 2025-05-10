package com.api.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.api.entity.District;
import com.api.repository.DistrictRepository;
import com.api.service.DistrictService;

@Service
public class DistrictServiceImpl implements DistrictService{

	@Autowired
	private DistrictRepository districtRepository;
	
	@Override
	public District post(District district) {
		// TODO Auto-generated method stub
		return districtRepository.save(district);
	}

	@Override
	public List<District> getdata() {
		// TODO Auto-generated method stub
		return districtRepository.findAll();
	}

	@Override
	public District getbyid(long id) {
		// TODO Auto-generated method stub
		return districtRepository.findById(id).orElse(null);
	}

	@Override
	public void deletedata(long id) {
		// TODO Auto-generated method stub
		 districtRepository.deleteById(id);;
	}
	
	
	
}
