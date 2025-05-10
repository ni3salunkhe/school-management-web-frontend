package com.api.security;

import com.api.entity.Developer;
import com.api.entity.School;
import com.api.entity.Staff;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class CustomUserDetails implements UserDetails {

    private String username;
    private String password;
    private String role;

    public CustomUserDetails(Developer developer) {
        this.username = developer.getUsername();
        this.password = developer.getPassword();
        this.role = "DEVELOPER";
    }

    public CustomUserDetails(Staff staff) {
        this.username = staff.getUsername();
        this.password = staff.getPassword();
        this.role = "STAFF";
    }

    public CustomUserDetails(School school) {
        this.username = school.getHeadMasterUserName(); // assuming headmaster uses school login
        this.password = school.getHeadMasterPassword();
        this.role = "HEADMASTER";
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    // You can enhance these flags if needed
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
