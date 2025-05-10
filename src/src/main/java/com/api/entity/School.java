package com.api.entity;

import java.sql.Date;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;

import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class School {
	
	@Id
	private long udiseNo;
	
	private String schoolSlogan;
	private String sansthaName;
	private String schoolName;
	@ManyToOne
	@JoinColumn(name = "stateId")
	private State state;
	@ManyToOne
	@JoinColumn(name="districtId")
	private District district;
	@ManyToOne
	@JoinColumn(name = "tehsilId")
	private Tehsil tehsil;
	@ManyToOne
	@JoinColumn(name = "villageId")
	private Village village;
	
	private String pinCode;
	private String medium;
	private String headMasterUserName;
	private String headMasterMobileNo;
	private String headMasterPassword;
	private String schoolPlace;
	private String board;
	private String role;
	private String boardDivision;
	private String boardIndexNo;
	private String schoolEmailId;
	private String schoolApprovalNo;
	private Date createdAt;
	
	@Lob
	@Column(name = "logo" ,columnDefinition = "LONGBLOB")
	private byte[] logo;
}
