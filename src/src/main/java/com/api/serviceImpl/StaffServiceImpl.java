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

import com.api.entity.Staff;
import com.api.repository.StaffRepository;
import com.api.service.StaffService;

@Service
public class StaffServiceImpl implements StaffService, UserDetailsService{

	@Autowired
	private StaffRepository staffRepository;
	
	@Override
	public Staff post(Staff staff) {
		// TODO Auto-generated method stub
		return staffRepository.save(staff);
	}

	@Override
	public List<Staff> getdata() {
		// TODO Auto-generated method stub
		return staffRepository.findAll();
	}

	@Override
	public Staff getbyid(long id) {
		// TODO Auto-generated method stub
		return staffRepository.findById(id).orElse(null);
	}

	@Override
	public void deletedata(long id) {
		// TODO Auto-generated method stub
		staffRepository.deleteById(id);
	}

	@Override
	public List<Staff> getUnassignedStaff() {
		// TODO Auto-generated method stub
		return staffRepository.findUnassignedStaff();
	}

	@Override
	public List<Staff> getaAllDataByUdise(long udiseNo) {
		// TODO Auto-generated method stub
		return staffRepository.findBySchool_UdiseNo(udiseNo);
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		Staff staff= staffRepository.findByUsername(username);
		if(staff==null) {
			throw new UsernameNotFoundException("No user found with username "+username);
		}

		List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(staff.getRole()));

	    return new org.springframework.security.core.userdetails.User(
	    		staff.getUsername(),
	    		staff.getPassword(),
	        true,  // accountNonExpired
	        true,  // credentialsNonExpired
	        true,  // accountNonLocked
	        true,  // enabled
	        authorities
	    );
	}

	@Override
	public Staff getByUsername(String username) {
		// TODO Auto-generated method stub
		return staffRepository.findByUsername(username);
	}

	@Override
	public Staff getByUsernameAndUdise(long udiseNo, String username) {
		// TODO Auto-generated method stub
		return staffRepository.findBySchoolUdiseNoAndUsername(udiseNo, username);
	}

}
