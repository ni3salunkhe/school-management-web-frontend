package com.api.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import lombok.Data;

@Entity
@Data
public class ClassTeacher {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;
	
	@ManyToOne
	@JoinColumn(name = "Standard" )
	private StandardMaster standardMaster;
	
	@ManyToOne
	@JoinColumn(name="division")
	private Division division;
	
	@OneToOne
	@JoinColumn(name="ClassTeacher",unique = true )
	private Staff staff;
	
	@ManyToOne
	@JoinColumn(name = "SchoolUdiseNo")
	private School schoolUdiseNo;
}
