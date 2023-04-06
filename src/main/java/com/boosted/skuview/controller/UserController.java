package com.boosted.skuview.controller;

import org.springframework.web.bind.annotation.RestController;

import com.boosted.skuview.model.AppUser;
import com.boosted.skuview.payloads.UserDto;
import com.boosted.skuview.service.UserService;

import jakarta.validation.Valid;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api")
public class UserController {

	@Autowired
	private UserService userService;

	@RequestMapping("/login")
	public String login() {
		return "login";
	}

	@RequestMapping("/users")
	public List<AppUser> getAllUsers() {
		return userService.getAllUsers();
	}

	@PostMapping("/register")
	public ResponseEntity<UserDto> createuser(@Valid @RequestBody UserDto user) {
		UserDto newuser = userService.createUser(user);
		return new ResponseEntity<>(newuser, HttpStatus.CREATED);
	}
}
