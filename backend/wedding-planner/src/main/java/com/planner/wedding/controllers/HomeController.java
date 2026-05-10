package com.planner.wedding.controllers;

import com.planner.wedding.entities.User;
import com.planner.wedding.repositories.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class HomeController {

    private UserRepository userRepository;

    public HomeController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/")
    public List<User> home() {
        return userRepository.findAll();
    }

    @GetMapping("/auth")
    public String test(Authentication authentication) {

        return "Logged user: "
                + authentication.getName();
    }
}