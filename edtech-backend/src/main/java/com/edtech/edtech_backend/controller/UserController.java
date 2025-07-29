// 용선님이 작업하신 controller로 변경

package com.edtech.edtech_backend.controller;

import com.edtech.edtech_backend.dto.UserDto;
import com.edtech.edtech_backend.entity.User;
import com.edtech.edtech_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 회원가입
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody UserDto userDto) {
        User savedUser = userService.register(userDto);
        return ResponseEntity.ok(savedUser);
    }

    // 이메일로 사용자 정보 조회
    @GetMapping("/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        User user = userService.findByEmail(email);
        return ResponseEntity.ok(user);
    }
}