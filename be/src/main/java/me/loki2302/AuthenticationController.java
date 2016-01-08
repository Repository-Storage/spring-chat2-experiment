package me.loki2302;

import me.loki2302.persistence.User;
import me.loki2302.persistence.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@PreAuthorize("isAuthenticated()")
public class AuthenticationController {
    @Autowired
    private UserRepository userRepository;

    @RequestMapping(value = "/api/me", method = RequestMethod.GET)
    public ResponseEntity getMe(Principal principal) {
        String username = principal.getName();
        User user = userRepository.findByName(username);
        if(user == null) {
            return ResponseEntity.notFound().build();
        }

        MeDto meDto = new MeDto();
        meDto.userId = user.id;
        meDto.username = user.name;

        return ResponseEntity.ok(meDto);
    }

    public static class MeDto {
        public long userId;
        public String username;
    }
}
