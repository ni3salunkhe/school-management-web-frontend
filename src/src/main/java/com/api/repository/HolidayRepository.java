package com.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.entity.Holiday;

public interface HolidayRepository extends JpaRepository<Holiday, Long>{

}
