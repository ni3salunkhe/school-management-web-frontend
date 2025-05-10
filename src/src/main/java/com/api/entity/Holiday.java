package com.api.entity;

import java.sql.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class Holiday {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;
	private String reason;
	@ManyToOne
	private Staff createdBy;
	@ManyToOne
	private School udise;
	private Date holidayDate;
}
