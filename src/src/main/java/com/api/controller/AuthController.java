package com.api.controller;


import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.dto.LoginDto;
import com.api.entity.Developer;
import com.api.entity.School;
import com.api.entity.Staff;
import com.api.service.DeveloperService;
import com.api.service.SchoolService;
import com.api.service.StaffService;
import com.api.util.JwtUtil;

@RestController
@RequestMapping("/public")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private DeveloperService developerService;

    @Autowired
    private StaffService staffService;

    @Autowired
    private SchoolService schoolService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/authenticate")
	public ResponseEntity<?> authenticate(@RequestBody LoginDto loginRequest) {
	    try {
	        // Log the incoming request for debugging purposes
	        System.out.println("Attempting to authenticate user: " + loginRequest.getUsername());
	
	        // Authenticate the user based on username and password
	        
	        
	        Object user = null;
	        String jwt="";
	        // Handle different user types
	        switch (loginRequest.getUserType().toUpperCase()) {
	            case "DEVELOPER":
	                // For developers, fetch the developer by username
	                Developer developer = developerService.getByUsername(loginRequest.getUsername());
	                if (developer != null) {
	                    user = developer;
	                }
	                break;
	                
	            case "STAFF":
	                // For staff, fetch the staff member by username
	                Staff staff = staffService.getByUsername(loginRequest.getUsername());
	                if (staff != null) {
	                    user = staff;
	                }
	                break;
	
	            case "HEADMASTER":
	                // For headmasters, fetch the school by headmaster username
	                School school = schoolService.getByUsername(loginRequest.getUsername());
	                if (school != null) {
	                    user = school;
	                }
	                break;
	
	            default:
	                // Invalid user type provided in the request
	                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid user type");
	        }
	
	        // Check if user is found
	        if (user != null) {
	            // Generate a JWT for the authenticated user
	            jwt = jwtUtil.generateTokenBasedOnRole(user);
	            Map<String, String> response = new HashMap<>();
	            response.put("token", jwt);
	            return ResponseEntity.ok(response);

	        } else {
	            // If no user is found, return a 404 (Not Found) response
	            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
	        }
	
	    } catch (Exception e) {
	        // Handle any errors that may occur during authentication
	        System.err.println("Authentication failed: " + e.getMessage());
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username/password");
	    }
	}

}