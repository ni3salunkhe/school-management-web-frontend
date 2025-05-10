package com.api.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.api.entity.ClassTeacher;
import com.api.entity.School;
import com.api.repository.ClassTeacherRepository;
import com.api.service.ClassTeacherService;

@Service
public class ClassTeacherServiceImpl implements ClassTeacherService{

	@Autowired
	private ClassTeacherRepository classTeacherRepository;
	
	@Override
	public ClassTeacher post(ClassTeacher classTeacher) {
		// TODO Auto-generated method stub
		return classTeacherRepository.save(classTeacher);
	}

	@Override
	public List<ClassTeacher> getdata() {
		// TODO Auto-generated method stub
		return classTeacherRepository.findAll();
	}

	@Override
	public ClassTeacher getbyid(long id) {
		// TODO Auto-generated method stub
		return classTeacherRepository.findById(id).orElse(null);
	}

	@Override
	public void deletedata(long id) {
		// TODO Auto-generated method stub
		classTeacherRepository.deleteById(id);
	}

	@Override
	public List<ClassTeacher> getbyudise(School school) {
		// TODO Auto-generated method stub
		return classTeacherRepository.findBySchoolUdiseNo(school);
	}

	@Override
	public ClassTeacher getByStaffId(long staffId) {
		// TODO Auto-generated method stub
		return classTeacherRepository.findByStaffId(staffId);
	}

}
