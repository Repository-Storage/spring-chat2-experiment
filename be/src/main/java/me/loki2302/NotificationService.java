package me.loki2302;

import me.loki2302.notifications.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class NotificationService {
    private final static String NOTIFICATIONS_DESTINATION = "/notifications";

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    // notify everyone
    public void notifyRoomCreated(long roomId, String roomName) {
        RoomCreatedNotificationDto roomCreatedNotificationDto = new RoomCreatedNotificationDto();
        roomCreatedNotificationDto.id = roomId;
        roomCreatedNotificationDto.name = roomName;
        simpMessagingTemplate.convertAndSend(NOTIFICATIONS_DESTINATION, roomCreatedNotificationDto);
    }

    // notify everyone
    public void notifyRoomUpdated(long roomId, String roomName) {
        RoomUpdatedNotificationDto roomUpdatedNotificationDto = new RoomUpdatedNotificationDto();
        roomUpdatedNotificationDto.id = roomId;
        roomUpdatedNotificationDto.name = roomName;
        simpMessagingTemplate.convertAndSend(NOTIFICATIONS_DESTINATION, roomUpdatedNotificationDto);
    }

    // notify everyone
    public void notifyRoomDeleted(long roomId) {
        RoomDeletedNotificationDto roomDeletedNotificationDto = new RoomDeletedNotificationDto();
        roomDeletedNotificationDto.id = roomId;
        simpMessagingTemplate.convertAndSend(NOTIFICATIONS_DESTINATION, roomDeletedNotificationDto);
    }

    // notify room members + that user
    public void notifyUserJoinedRoom(long userId, String username, long roomId, String roomName) {
        UserJoinedRoomNotificationDto userJoinedRoomNotificationDto = new UserJoinedRoomNotificationDto();
        userJoinedRoomNotificationDto.userId = userId;
        userJoinedRoomNotificationDto.username = username;
        userJoinedRoomNotificationDto.roomId = roomId;
        userJoinedRoomNotificationDto.roomName = roomName;
        simpMessagingTemplate.convertAndSend(NOTIFICATIONS_DESTINATION, userJoinedRoomNotificationDto);
    }

    // notify room members + that user
    public void notifyUserLeftRoom(long userId, String username, long roomId, String roomName) {
        UserLeftRoomNotificationDto userLeftRoomNotificationDto = new UserLeftRoomNotificationDto();
        userLeftRoomNotificationDto.userId = userId;
        userLeftRoomNotificationDto.username = username;
        userLeftRoomNotificationDto.roomId = roomId;
        userLeftRoomNotificationDto.roomName = roomName;
        simpMessagingTemplate.convertAndSend(NOTIFICATIONS_DESTINATION, userLeftRoomNotificationDto);
    }

    // notify room members
    public void notifyMessage(long userId, String username, long roomId, String roomName, long messageId, String messageText) {
        MessageNotificationDto messageNotificationDto = new MessageNotificationDto();
        messageNotificationDto.userId = userId;
        messageNotificationDto.username = username;
        messageNotificationDto.roomId = roomId;
        messageNotificationDto.roomName = roomName;
        messageNotificationDto.messageId = messageId;
        messageNotificationDto.messageText = messageText;
        simpMessagingTemplate.convertAndSend(NOTIFICATIONS_DESTINATION, messageNotificationDto);
    }
}
