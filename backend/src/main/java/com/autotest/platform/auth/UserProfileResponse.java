package com.autotest.platform.auth;

public record UserProfileResponse(
    Long id,
    String username,
    Role role
) {
}
