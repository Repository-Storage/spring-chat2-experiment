package me.loki2302;

import me.loki2302.persistence.Room;
import me.loki2302.persistence.RoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;

import java.net.URI;
import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder.controller;

@RestController
@PreAuthorize("isAuthenticated()")
public class RoomController {
    private final static Logger LOG = LoggerFactory.getLogger(RoomController.class);

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private NotificationService notificationService;

    @RequestMapping(value = "/api/rooms", method = RequestMethod.POST)
    public ResponseEntity createRoom(
            @RequestBody RoomWithoutIdDto roomWithoutIdDto, Principal principal) {

        LOG.info("createRoom(): {}", principal.getName());

        Room room = roomRepository.findByName(roomWithoutIdDto.name);
        if(room != null) {
            return ResponseEntity.badRequest().build();
        }

        room = new Room();
        room.name = roomWithoutIdDto.name;
        room = roomRepository.save(room);

        long roomId = room.id;

        notificationService.notifyRoomCreated(roomId, roomWithoutIdDto.name);

        URI roomUri = MvcUriComponentsBuilder
                .fromMethodCall(controller(RoomController.class).getRoom(roomId))
                .build().toUri();

        return ResponseEntity.created(roomUri).build();
    }

    @RequestMapping(value = "/api/rooms/{id}", method = RequestMethod.PUT)
    public ResponseEntity updateRoom(
            @PathVariable("id") long id,
            @RequestBody RoomWithoutIdDto roomDto) {

        Room room = roomRepository.findOne(id);
        if(room == null) {
            return ResponseEntity.notFound().build();
        }

        room.name = roomDto.name;
        roomRepository.save(room);

        notificationService.notifyRoomUpdated(id, roomDto.name);

        return ResponseEntity.ok().build();
    }

    @RequestMapping(value = "/api/rooms/{id}", method = RequestMethod.DELETE)
    public ResponseEntity deleteRoom(
            @PathVariable("id") long id) {

        Room room = roomRepository.findOne(id);
        if(room == null) {
            return ResponseEntity.notFound().build();
        }

        roomRepository.delete(room);

        notificationService.notifyRoomDeleted(id);

        return ResponseEntity.noContent().build();
    }

    @RequestMapping(value = "/api/rooms/{id}", method = RequestMethod.GET)
    public ResponseEntity getRoom(
            @PathVariable("id") long id) {

        Room room = roomRepository.findOne(id);
        if(room == null) {
            return ResponseEntity.notFound().build();
        }

        RoomDto roomDto = makeRoomDto(room);
        return ResponseEntity.ok(roomDto);
    }

    @RequestMapping(value = "/api/rooms", method = RequestMethod.GET)
    public ResponseEntity getRooms() {
        List<Room> rooms = roomRepository.findAll();
        List<RoomDto> roomDtos = rooms.stream()
                .map(RoomController::makeRoomDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(roomDtos);
    }

    private static RoomDto makeRoomDto(Room room) {
        RoomDto roomDto = new RoomDto();
        roomDto.id = room.id;
        roomDto.name = room.name;
        return roomDto;
    }

    public static class RoomWithoutIdDto {
        public String name;
    }

    public static class RoomDto {
        public long id;
        public String name;
    }
}
