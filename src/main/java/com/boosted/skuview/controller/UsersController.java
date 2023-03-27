package com.boosted.skuview.controller;

import org.springframework.web.bind.annotation.RestController;

import com.boosted.skuview.model.Users;
import com.boosted.skuview.service.UsersService;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
public class UsersController {

	@Autowired
	private UsersService usersService;

	@RequestMapping("/login")
	public String login() {
		return "login";
	}

	@RequestMapping("/users")
	public List<Users> getAllUsers() {
		return usersService.getAllUsers();
	}

	@PostMapping("/register")
	public String createuser(@RequestBody Users user) {

		usersService.createUser(user);
		return "Created";
	}
}
