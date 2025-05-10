package com.api.security;

import com.api.entity.Developer;
import com.api.entity.School;
import com.api.entity.Staff;
import com.api.service.DeveloperService;
import com.api.service.SchoolService;
import com.api.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private DeveloperService developerService;

    @Autowired
    private StaffService staffService;

    @Autowired
    private SchoolService schoolService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Developer developer = developerService.getByUsername(username);
        if (developer != null) {
        	
            return new CustomUserDetails(developer);
        }

        Staff staff = staffService.getByUsername(username);
        if (staff != null) {
            return new CustomUserDetails(staff);
        }

        School school = schoolService.getByUsername(username);
        if (school != null) {
        	System.out.println(school);
            return new CustomUserDetails(school);
        }

        throw new UsernameNotFoundException("No user found with username: " + username);
    }
}
