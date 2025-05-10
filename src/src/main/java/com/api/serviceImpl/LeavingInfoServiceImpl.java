package com.api.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.api.entity.LeavingInfo;
import com.api.entity.School;
import com.api.entity.Student;
import com.api.repository.LeavingInfoRepository;
import com.api.service.LeavingInfoService;

@Service
public class LeavingInfoServiceImpl implements LeavingInfoService{

	@Autowired
	private LeavingInfoRepository leavingInfoRepository;
	
	@Override
	public LeavingInfo post(LeavingInfo leavigInfo) {
		// TODO Auto-generated method stub
		return leavingInfoRepository.save(leavigInfo);
	}

	@Override
	public List<LeavingInfo> getdata() {
		// TODO Auto-generated method stub
		return leavingInfoRepository.findAll();
	}

	@Override
	public LeavingInfo getbyid(long id) {
		// TODO Auto-generated method stub
		return leavingInfoRepository.findById(id).orElse(null);
	}

	@Override
	public void deletedata(long id) {
		// TODO Auto-generated method stub
		leavingInfoRepository.deleteById(id);
	}

	@Override
	public LeavingInfo getdatabystudentId(Student studentId, School schoolUdise) {
		// TODO Auto-generated method stub
		return leavingInfoRepository.findByStudentIdAndSchoolUdise(studentId, schoolUdise);
	}

}
