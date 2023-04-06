package com.boosted.skuview.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.boosted.skuview.model.AppUser;

public interface UserRepository extends JpaRepository<AppUser, Integer>  {
	AppUser findByEmail(String email);
}
