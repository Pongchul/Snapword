package com.snapword.backend.member.controller;

import com.snapword.backend.config.SecurityAuditLog;
import com.snapword.backend.member.dto.AuthResponse;
import com.snapword.backend.member.dto.LoginRequest;
import com.snapword.backend.member.dto.MemberDto;
import com.snapword.backend.member.dto.SignupRequest;
import com.snapword.backend.member.exception.DuplicateEmailException;
import com.snapword.backend.member.security.JwtTokenProvider;
import com.snapword.backend.member.security.MemberPrincipal;
import com.snapword.backend.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final MemberService memberService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        MemberDto member = memberService.signup(request);
        // 가입 직후 바로 로그인 상태로 만든다
        MemberPrincipal principal = authenticate(request.email(), request.password());
        SecurityAuditLog.LOG.info("회원가입: email={}", request.email());
        return ResponseEntity.status(HttpStatus.CREATED).body(toAuthResponse(principal));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        MemberPrincipal principal = authenticate(request.email(), request.password());
        return ResponseEntity.ok(toAuthResponse(principal));
    }

    @GetMapping("/me")
    public ResponseEntity<MemberDto> me(@AuthenticationPrincipal MemberPrincipal principal) {
        return ResponseEntity.ok(toDto(principal));
    }

    private MemberPrincipal authenticate(String email, String password) {
        UsernamePasswordAuthenticationToken authRequest =
                UsernamePasswordAuthenticationToken.unauthenticated(email, password);
        Authentication authResult = authenticationManager.authenticate(authRequest);
        return (MemberPrincipal) authResult.getPrincipal();
    }

    private AuthResponse toAuthResponse(MemberPrincipal principal) {
        String token = jwtTokenProvider.generateToken(principal.getMemberId(), principal.getEmail());
        return new AuthResponse(token, toDto(principal));
    }

    private MemberDto toDto(MemberPrincipal principal) {
        return new MemberDto(principal.getMemberId(), principal.getEmail(), principal.getNickname());
    }

    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<String> handleDuplicateEmail(DuplicateEmailException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<String> handleLocked(LockedException e) {
        return ResponseEntity.status(HttpStatus.LOCKED)
                .body("로그인 실패 횟수를 초과해 계정이 잠겼습니다. 15분 후 다시 시도해주세요.");
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<String> handleAuthenticationException(AuthenticationException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
}
