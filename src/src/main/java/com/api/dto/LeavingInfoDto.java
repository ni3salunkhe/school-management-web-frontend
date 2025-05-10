package com.api.dto;

import java.sql.Date;

import lombok.Data;

@Data
public class LeavingInfoDto {

	private long studentId;
	
	private long schoolUdise;

	private String reasonOfLeavingSchool;

	private String progress;

	private String behavior;

	private Date dateOfLeavingSchool;

	private String remark;

	private String lcNumber;
	
	private Date lcDate;

	private String otherRemark;

	private Date createdAt;

}
