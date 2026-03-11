package com.autotest.platform.auth;

public record AuthResponse(
    String token,
    String tokenType,
    String username,
    Role role
) {
}
