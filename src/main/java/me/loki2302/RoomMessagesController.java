package me.loki2302;

import me.loki2302.persistence.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@PreAuthorize("isAuthenticated()")
public class RoomMessagesController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private NotificationService notificationService;

    @RequestMapping(value = "/api/rooms/{roomId}/messages", method = RequestMethod.GET)
    public ResponseEntity getRoomMessages(
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
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Message> messages = messageRepository.findByRoom(room);
        List<MessageDto> messageDtos = messages.stream()
                .map(RoomMessagesController::messageToMessageDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(messageDtos);
    }

    @RequestMapping(value = "/api/rooms/{roomId}/messages", method = RequestMethod.POST)
    public ResponseEntity sendRoomMessage(
            @PathVariable("roomId") long roomId,
            @RequestBody MessageWithoutIdDto messageWithoutIdDto,
            Principal principal) {

        Room room = roomRepository.findOne(roomId);
        if(room == null) {
            return ResponseEntity.notFound().build();
        }

        String username = principal.getName();
        User user = userRepository.findByName(username);

        Membership membership = membershipRepository.findByRoomAndUser(room, user);
        if(membership == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Message message = new Message();
        message.room = room;
        message.user = user;
        message.text = messageWithoutIdDto.text;
        message = messageRepository.save(message);

        notificationService.notifyMessage(user.id, user.name, roomId, room.name, message.id, message.text);

        return ResponseEntity.ok().build(); // TODO: replace with 'created'
    }

    private static MessageDto messageToMessageDto(Message message) {
        MessageDto messageDto = new MessageDto();
        messageDto.id = message.id;
        messageDto.text = message.text;
        messageDto.roomId = message.room.id;
        messageDto.userId = message.user.id;
        return messageDto;
    }

    public static class MessageWithoutIdDto {
        public String text;
    }

    public static class MessageDto {
        public long id;
        public String text;
        public long roomId;
        public long userId;
    }
}
