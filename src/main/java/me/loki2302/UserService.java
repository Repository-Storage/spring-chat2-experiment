package me.loki2302;

import me.loki2302.persistence.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public boolean doesUserExist(String name) {
        User user = userRepository.findByName(name);
        return user != null;
    }

    public long createUser(String name) {
        User user = userRepository.findByName(name);
        if(user != null) {
            throw new RuntimeException("User already exists");
        }

        user = new User();
        user.name = name;
        user = userRepository.save(user);

        return user.id;
    }

}
