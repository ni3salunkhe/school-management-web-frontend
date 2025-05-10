package com.api.serviceImpl;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.api.entity.Developer;
import com.api.repository.DeveloperRepository;
import com.api.service.DeveloperService;

@Service
public class DeveloperServiceImpl implements DeveloperService, UserDetailsService{
	
	@Autowired
	DeveloperRepository developerRepository;
	
	@Autowired
	PasswordEncoder passwordEncoder;

	public Developer saveData(Developer developer) {
		// TODO Auto-generated method stub
		return developerRepository.save(developer);
	}

	public Developer getByUsername(String username) {
		// TODO Auto-generated method stub
		return developerRepository.findByUsername(username);
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		// TODO Auto-generated method stub
		Developer developer= developerRepository.findByUsername(username);
		if(developer==null) {
			throw new UsernameNotFoundException("No user found with username "+username);
		}

		List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(developer.getRole()));

	    return new org.springframework.security.core.userdetails.User(
	        developer.getUsername(),
	        developer.getPassword(),
	        true,  // accountNonExpired
	        true,  // credentialsNonExpired
	        true,  // accountNonLocked
	        true,  // enabled
	        authorities
	    );
	}

}
