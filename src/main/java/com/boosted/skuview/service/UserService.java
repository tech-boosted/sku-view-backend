package com.boosted.skuview.service;

import com.boosted.skuview.model.AppUser;
import com.boosted.skuview.payloads.UserDto;

import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boosted.skuview.repository.UserRepository;

@Service
public class UserService{
	
	@Autowired
	private UserRepository userRepo;
	
	@Autowired
	private ModelMapper modelMapper;
	
	public List<AppUser> getAllUsers() {
		List<AppUser> users = new ArrayList<>();
		userRepo.findAll().forEach(users::add);
		return users;
	}
	
	public UserDto createUser(UserDto userDto) {
		AppUser user = this.dtoToUser(userDto);
		AppUser savedUser = userRepo.save(user);
		return this.userToDto(savedUser);
	}
	
	public AppUser getUser(String email) {
		return userRepo.findByEmail(email);
	}

	public AppUser dtoToUser(UserDto userDto) {
		AppUser user = this.modelMapper.map(userDto, AppUser.class);
		return user;
	}

	public UserDto userToDto(AppUser appUser) {
		UserDto userDto = this.modelMapper.map(appUser, UserDto.class);
		return userDto;
	}
}
