package me.loki2302;

import me.loki2302.persistence.User;
import me.loki2302.persistence.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@PreAuthorize("isAuthenticated()")
public class UserController {
    private final static Logger LOG = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;


    @RequestMapping(value = "/api/users", method = RequestMethod.GET)
    public ResponseEntity getUsers() {
        List<User> users = userRepository.findAll();
        List<UserDto> userDtos = users.stream()
                .map(UserController::makeUserDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }

    private static UserDto makeUserDto(User user) {
        UserDto userDto = new UserDto();
        userDto.id = user.id;
        userDto.name = user.name;
        return userDto;
    }

    public static class UserDto {
        public long id;
        public String name;
    }
}
