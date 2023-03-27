package com.boosted.skuview.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.boosted.skuview.model.Users;

public interface UsersRepository extends JpaRepository<Users, Integer>  {
 
}
