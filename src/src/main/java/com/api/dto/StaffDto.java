package com.api.dto;

import java.sql.Date;

import lombok.Data;

@Data
public class StaffDto {

	private String fname;

	private String fathername;
	
	private String lname;

	private String username;

	private String email;

	private String mobile;

	private String password;

	private String standard;

	private String role;

	private String level;
	
	private long school;
	
	private String status;

	private Date createdAt;
}
