package com.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.api.entity.Tehsil;

@Repository
public interface Tehsilrepository extends JpaRepository<Tehsil, Long>{

}
