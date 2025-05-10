package com.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.api.entity.Village;

@Repository
public interface VillageRepository extends JpaRepository<Village, Long>{

}
