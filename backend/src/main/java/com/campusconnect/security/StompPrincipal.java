package com.campusconnect.security;

import java.security.Principal;

public class StompPrincipal implements Principal {

    private final String name;

    public StompPrincipal(Long userId) {
        this.name = userId.toString();
    }

    @Override
    public String getName() {
        return name;
    }
}
