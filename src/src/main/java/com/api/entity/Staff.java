package com.api.entity;

import java.sql.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class Staff {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;
	
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
	
	@ManyToOne
	private School school;
	
	private String status;
	
	private Date createdAt;
	
}
