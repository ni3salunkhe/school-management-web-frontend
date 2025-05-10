package com.api.serviceImpl;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.api.entity.AcademicCurrent;
import com.api.entity.School;
import com.api.entity.Student;
import com.api.repository.AcademicCurrentRepository;
import com.api.repository.SchoolRepository;
import com.api.repository.StudentRepository;
import com.api.service.AcademicCurrentService;
import com.api.service.SchoolService;

@Service
public class AcademicServiceImpl implements AcademicCurrentService{

	@Autowired
	private AcademicCurrentRepository academicCurrentRepository;
	
	@Autowired
	private StudentRepository studentRepository;
	
	@Autowired
	private SchoolRepository schoolRepository;
	
	@Autowired
	private SchoolService schoolService;
	
	@Override
	public AcademicCurrent post(AcademicCurrent academicCurrent) {
		// TODO Auto-generated method stub
		return academicCurrentRepository.save(academicCurrent);
	}

	@Override
	public List<AcademicCurrent> getdata() {
		// TODO Auto-generated method stub
		return academicCurrentRepository.findAll();
	}

	@Override
	public AcademicCurrent getbyid(long id) {
		// TODO Auto-generated method stub
		return academicCurrentRepository.findById(id).orElse(null);
	}

	@Override
	public void deletedata(long id) {
		// TODO Auto-generated method stub
		academicCurrentRepository.deleteById(id);
	}

	@Override
	public List<AcademicCurrent> getByClassTeacheId(long classTeacherId) {
		// TODO Auto-generated method stub
		return academicCurrentRepository.findByClassTeacherId(classTeacherId);
	}
	
	 public Optional<AcademicCurrent> getAcademicCurrentByStudentAndSchool(Long studentId, long schoolUdiseNo) {
	        // First get the Student and School entities
	        Optional<Student> student = studentRepository.findById(studentId);
	        Optional<School> school = schoolRepository.findById(schoolUdiseNo);
	        
	        if (student.isPresent() && school.isPresent()) {
	            return academicCurrentRepository.findByStudentIdAndSchoolUdiseNo(student.get(), school.get());
	        }
	        
	        return Optional.empty();
	    }

	@Override
	public List<AcademicCurrent> getBySchool(long schoolUdiseNo) {
		// TODO Auto-generated method stub
		School school=schoolService.getbyid(schoolUdiseNo);
		
		return academicCurrentRepository.findBySchoolUdiseNo(school);
		
	}

	@Override
	public List<AcademicCurrent> getAcademicsByUdiseAndTeacherId(long udiseNo, long teacherId) {
		// TODO Auto-generated method stub
		Optional<School> school = schoolRepository.findById(udiseNo);
		
		return academicCurrentRepository.findBySchoolUdiseNoAndClassTeacherId(school, teacherId);
	}

}
