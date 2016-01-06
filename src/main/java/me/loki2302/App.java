package me.loki2302;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry;
import org.springframework.security.config.annotation.web.socket.AbstractSecurityWebSocketMessageBrokerConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.socket.config.annotation.AbstractWebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

@SpringBootApplication
@Import(App.WebSocketConfig.class)
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }

    @Configuration
    @EnableWebSocketMessageBroker
    public static class WebSocketConfig extends AbstractWebSocketMessageBrokerConfigurer {
        @Override
        public void registerStompEndpoints(StompEndpointRegistry registry) {
            registry.addEndpoint("/ws")
                    .setAllowedOrigins("http://localhost:3000")
                    .withSockJS();
        }

        @Override
        public void configureMessageBroker(MessageBrokerRegistry registry) {
            registry.setApplicationDestinationPrefixes("/app");
        }
    }

    @Configuration
    public static class WebConfig extends WebMvcConfigurerAdapter {
        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/**")
                    .allowedOrigins("http://localhost:3000")
                    .allowedMethods("POST", "PUT", "GET", "OPTIONS", "DELETE")
                    .allowedHeaders("Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization")
                    .allowCredentials(true)
                    .maxAge(3600);
        }
    }

    @Configuration
    @EnableWebSecurity
    @EnableGlobalMethodSecurity(prePostEnabled = true)
    public static class SecurityConfig extends WebSecurityConfigurerAdapter {


        @Override
        protected void configure(AuthenticationManagerBuilder auth) throws Exception {
            auth.userDetailsService(userDetailsService());
        }

        @Override
        protected void configure(HttpSecurity http) throws Exception {
            http
                    .csrf().disable()
                    .httpBasic().realmName("dummy").and()
                    .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.NEVER);
        }

        @Bean
        public UserDetailsService userDetailsService() {
            return new MyUserDetailsService();
        }
    }

    public static class MyUserDetailsService implements UserDetailsService {
        @Autowired
        private UserService chatService;

        @Override
        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
            if(!chatService.doesUserExist(username)) {
                chatService.createUser(username);
            }

            return new User(username, "qwerty", AuthorityUtils.NO_AUTHORITIES);
        }
    }
}
