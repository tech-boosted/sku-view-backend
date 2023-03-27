package com.boosted.skuview.service;

import com.boosted.skuview.model.Users;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boosted.skuview.repository.UsersRepository;

@Service
public class UsersService{
	
	@Autowired
	private UsersRepository userRepo;
	
	public List<Users> getAllUsers() {
		List<Users> users = new ArrayList<>();
		userRepo.findAll().forEach(users::add);
		return users;
	}
	
	public Users createUser(Users user) {
		return userRepo.save(user);
	}

}
