package com.api.service;

import java.util.List;

import com.api.entity.ClassTeacher;
import com.api.entity.School;

public interface ClassTeacherService {
	
	public ClassTeacher post(ClassTeacher classTeacher);
	
	public List<ClassTeacher> getdata();
	
	public ClassTeacher getbyid(long id);
	
	public void deletedata(long id);
	
	public List<ClassTeacher> getbyudise(School school);
	
	public ClassTeacher getByStaffId(long staffId);
	
}
