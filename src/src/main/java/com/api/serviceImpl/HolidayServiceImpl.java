package com.api.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.api.entity.Holiday;
import com.api.repository.HolidayRepository;
import com.api.service.HolidayService;

@Service
public class HolidayServiceImpl implements HolidayService{
	
	@Autowired
	private HolidayRepository holidayRepository;

	@Override
	public List<Holiday> getallData() {
		// TODO Auto-generated method stub
		return holidayRepository.findAll();
	}

	@Override
	public Holiday saveData(Holiday holiday) {
		// TODO Auto-generated method stub
		return holidayRepository.save(holiday);
	}

	@Override
	public Holiday getbyid(long id) {
		// TODO Auto-generated method stub
		return holidayRepository.findById(id).orElse(null);
	}

	@Override
	public void deleteData(long id) {
		// TODO Auto-generated method stub
		holidayRepository.deleteById(id);
	}

}
