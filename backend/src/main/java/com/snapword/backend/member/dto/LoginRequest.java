package com.snapword.backend.member.dto;

public record LoginRequest(
        String email,
        String password
) {}
