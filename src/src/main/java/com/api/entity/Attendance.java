package com.api.entity;

import java.time.YearMonth;

import com.api.config.YearMonthAttributeConverter;

import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;


@Entity
@Data
public class Attendance {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "school_udise_no", nullable = false)
	private School school;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "stud_id", nullable = false)
	private Student studId;
	@ManyToOne
    @JoinColumn(name = "staff_id")
    private Staff staffId;
	private long registerNumber;
	private String teacherQualification;
    private String division;
    private String medium;
    @Convert(converter = YearMonthAttributeConverter.class)  // Convert YearMonth to String
    private YearMonth monthnyear;
    private int totalDays;
    private int workDays;
    private int sundays;
    private int holidays;
    private int totala;
    private int totalp;
    private double totalPPercentage;
    private int std;
    private String stdInWords;
    private String status;
    private String day1 = "P";
    private String day2 = "P";
    private String day3 = "P";
    private String day4 = "P";
    private String day5 = "P";
    private String day6 = "P";
    private String day7 = "P";
    private String day8 = "P";
    private String day9 = "P";
    private String day10 = "P";
    private String day11 = "P";
    private String day12 = "P";
    private String day13 = "P";
    private String day14 = "P";
    private String day15 = "P";
    private String day16 = "P";
    private String day17 = "P";
    private String day18 = "P";
    private String day19 = "P";
    private String day20 = "P";
    private String day21 = "P";
    private String day22 = "P";
    private String day23 = "P";
    private String day24 = "P";
    private String day25 = "P";
    private String day26 = "P";
    private String day27 = "P";
    private String day28 = "P";
    private String day29 = "P";
    private String day30 = "P";
    private String day31 = "p";
}
