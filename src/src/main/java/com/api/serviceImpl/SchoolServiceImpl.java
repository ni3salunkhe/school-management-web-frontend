package com.api.serviceImpl;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.api.entity.School;
import com.api.repository.SchoolRepository;
import com.api.service.SchoolService;

@Service
public class SchoolServiceImpl implements SchoolService, UserDetailsService{

	@Autowired
	private SchoolRepository schoolRepository;
	
	@Override
	public School post(School school) {
		// TODO Auto-generated method stub
		return schoolRepository.save(school);
	}

	@Override
	public List<School> getdata() {
		// TODO Auto-generated method stub
		return schoolRepository.findAll();
	}

	@Override
	public School getbyid(long id) {
		// TODO Auto-generated method stub
		return schoolRepository.findById(id).orElse(null);
	}

	@Override
	public void deletedata(long id) {
		// TODO Auto-generated method stub
		schoolRepository.deleteById(id);
		
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		School school= schoolRepository.findByHeadMasterUserName(username);
		if(school==null) {
			throw new UsernameNotFoundException("No user found with username "+username);
		}

		List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(school.getRole()));

	    return new org.springframework.security.core.userdetails.User(
	        school.getHeadMasterUserName(),
	        school.getHeadMasterPassword(),
	        true,  // accountNonExpired
	        true,  // credentialsNonExpired
	        true,  // accountNonLocked
	        true,  // enabled
	        authorities
	    );
	}
	
	@Override
	public School getByUsername(String username) {
		// TODO Auto-generated method stub
		return schoolRepository.findByHeadMasterUserName(username);
	}

}
