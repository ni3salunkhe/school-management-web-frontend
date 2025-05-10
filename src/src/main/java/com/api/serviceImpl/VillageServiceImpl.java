package com.api.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.api.entity.Village;
import com.api.repository.VillageRepository;
import com.api.service.VillageService;

@Service
public class VillageServiceImpl implements VillageService{

	
	@Autowired
	private VillageRepository villageRepository;
	
	
	@Override
	public Village post(Village village) {
		// TODO Auto-generated method stub
		return villageRepository.save(village);
	}

	@Override
	public List<Village> getdata() {
		// TODO Auto-generated method stub
		return villageRepository.findAll();
	}

	@Override
	public Village getbyid(long id) {
		// TODO Auto-generated method stub
		return villageRepository.findById(id).orElse(null);
	}

	@Override
	public void deletedata(long id) {
		// TODO Auto-generated method stub
		villageRepository.deleteById(id);
	}

}
