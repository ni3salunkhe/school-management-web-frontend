package com.api.dto;

import java.sql.Date;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class SchoolDto {

	private long udiseNo;
	

	private String schoolSlogan;
	private String sansthaName;
	private String schoolName;
	
	private long state;
	
	private long district;
	
	private long tehsil;
	
	private long village;

	private String pinCode;
	private String medium;
	private String headMasterUserName;
	private String headMasterMobileNo;
	private String headMasterPassword;
	private String schoolPlace;
	private String board;
	private String boardDivision;
	private String boardIndexNo;
	private String schoolEmailId;
	private String schoolApprovalNo;
	private String role;
	private Date createdAt;

	
	private MultipartFile logo;
	
	
}
