package com.api.service;

import org.springframework.stereotype.Service;

import com.api.entity.Developer;


@Service
public interface DeveloperService {
	public Developer saveData(Developer developer);
	public Developer getByUsername(String username);
}

