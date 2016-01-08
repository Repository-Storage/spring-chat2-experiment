package me.loki2302;

import me.loki2302.persistence.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@PreAuthorize("isAuthenticated()")
public class RoomMembersController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private NotificationService notificationService;

    @RequestMapping(value = "/api/rooms/{roomId}/members", method = RequestMethod.GET)
    public ResponseEntity getRoomMembers(
            @PathVariable("roomId") long roomId,
            Principal principal) {

        Room room = roomRepository.findOne(roomId);
        if(room == null) {
            return ResponseEntity.notFound().build();
        }

        String username = principal.getName();
        User user = userRepository.findByName(username);

        Membership membership = membershipRepository.findByRoomAndUser(room, user);
        if(membership == null) {
            // uncomment
            // return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Membership> memberships = membershipRepository.findByRoom(room);
        List<RoomMemberDto> roomMemberDtos = memberships.stream().map(p -> {
            RoomMemberDto roomMemberDto = new RoomMemberDto();
            roomMemberDto.id = p.userId;
            roomMemberDto.name = p.user.name; // how does it work?
            return roomMemberDto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(roomMemberDtos);
    }

    @RequestMapping(value = "/api/rooms/{roomId}/members/{userId}", method = RequestMethod.PUT)
    public ResponseEntity addRoomMember(
            @PathVariable("roomId") long roomId,
            @PathVariable("userId") long userId,
            Principal principal) {

        Room room = roomRepository.findOne(roomId);
        if(room == null) {
            return ResponseEntity.notFound().build();
        }

        User user = userRepository.findOne(userId);
        if(room == null) {
            return ResponseEntity.notFound().build();
        }

        Membership membership = membershipRepository.findByRoomAndUser(room, user);
        if(membership != null) {
            return ResponseEntity.noContent().build();
        }

        membership = new Membership();
        membership.roomId = roomId;
        membership.userId = user.id;
        membership = membershipRepository.save(membership);

        notificationService.notifyUserJoinedRoom(user.id, user.name, roomId, room.name);

        return ResponseEntity.noContent().build();
    }

    @RequestMapping(value = "/api/rooms/{roomId}/members/{memberId}", method = RequestMethod.DELETE)
    public ResponseEntity removeRoomMember(
            @PathVariable("roomId") long roomId,
            @PathVariable("memberId") long memberId,
            Principal principal) {

        Room room = roomRepository.findOne(roomId);
        if(room == null) {
            return ResponseEntity.notFound().build();
        }

        String username = principal.getName();
        User user = userRepository.findByName(username);

        Membership membership = membershipRepository.findByRoomAndUser(room, user);
        if(membership == null) {
            return ResponseEntity.notFound().build();
        }

        membershipRepository.delete(membership);

        notificationService.notifyUserLeftRoom(user.id, username, roomId, room.name);

        return ResponseEntity.noContent().build();
    }

    public static class RoomMemberDto {
        public long id;
        public String name;
    }
}
