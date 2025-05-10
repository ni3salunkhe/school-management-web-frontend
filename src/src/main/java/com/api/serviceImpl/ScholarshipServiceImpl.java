package com.api.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.api.entity.Scholarship;
import com.api.repository.ScholarshipRepository;
import com.api.service.ScholarshipService;

@Service
public class ScholarshipServiceImpl implements ScholarshipService{

	@Autowired
	private ScholarshipRepository scholarshipRepository;
	
	@Override
	public Scholarship post(Scholarship scholarship) {
		// TODO Auto-generated method stub
		return scholarshipRepository.save(scholarship);
	}

	@Override
	public List<Scholarship> getdata() {
		// TODO Auto-generated method stub
		return scholarshipRepository.findAll();
	}

	@Override
	public Scholarship getbyid(long id) {
		// TODO Auto-generated method stub
		return scholarshipRepository.findById(id).orElse(null);
	}

	@Override
	public void deletedata(long id) {
		// TODO Auto-generated method stub
	scholarshipRepository.deleteById(id);	
	}

}
