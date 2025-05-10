package com.api.util;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.api.entity.Developer;
import com.api.entity.School;
import com.api.entity.Staff;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {
	
	private String SECRET_KEY="8d938c1702f67c7f2797b51edab8089bb8c7b2dc727017a373d58a24c4d47eb271be7ab6117a71af2ba3763e55d103b28ed6b51a8ba4c3e7373866e8a7ada6f0";
	public String extractUsername(String token) {
        Claims claims = extractAllClaims(token);
        return claims.getSubject();
    }

	public Date extractExpiration(String token) {
		return extractAllClaims(token).getExpiration();
	}

	private Claims extractAllClaims(String token) {
	    return Jwts.parser()
	        .verifyWith(getSigninKey())  // Use the SecretKey directly
	        .build()
	        .parseSignedClaims(token)
	        .getPayload();
	}
	
	private Boolean isTokenExpired(String token) {
		return extractExpiration(token).before(new Date());
	}
	
	public String generateTokenBasedOnRole(Object user) {
	    Map<String, Object> claims = new HashMap<>();

	    if (user instanceof Staff staff) {
	        String role = staff.getRole();

	        switch (role.toUpperCase()) {
	            case "TEACHER":
	                claims.put("id", staff.getId());
	                claims.put("username", staff.getUsername());
	                claims.put("role", "TEACHER");
	                claims.put("udiseNo", staff.getSchool() != null ? staff.getSchool().getUdiseNo() : null);
	                break;

	            case "CLERK":
	                claims.put("username", staff.getUsername());
	                claims.put("role", "CLERK");
	                claims.put("udiseNo", staff.getSchool() != null ? staff.getSchool().getUdiseNo() : null);
	                break;
	            default:
	                throw new IllegalArgumentException("Unsupported staff role: " + role);
	        }

	        return createToken(claims, staff.getUsername());

	    } else if (user instanceof School school) {
	        claims.put("role", "HEADMASTER");
	        claims.put("username", school.getHeadMasterUserName());
	        claims.put("udiseNo", school.getUdiseNo());

	        return createToken(claims, school.getHeadMasterUserName());

	    } else if(user instanceof Developer developer){
	    	claims.put("role", "DEVELOPER");
	    	claims.put("username", developer.getUsername());
	    	
	    	return createToken(claims, developer.getUsername());
	    }
	    else {
	        throw new IllegalArgumentException("Unsupported user type: " + user.getClass().getName());
	    }
	}
	private String createToken(Map<String, Object> claims, String subject) {
	    return Jwts.builder()
	        .claims(claims)
	        .subject(subject)
	        .header().empty().add("typ","JWT")
	        .and()
	        .issuedAt(new Date(System.currentTimeMillis()))
	        .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hours
	        .signWith(getSigninKey())  // Use the SecretKey directly
	        .compact();
	}
	private SecretKey getSigninKey() {
		return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
	}

	public Boolean validateToken(String token, UserDetails userDetails) {
		final String username = extractUsername(token);
		return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
	}

}
