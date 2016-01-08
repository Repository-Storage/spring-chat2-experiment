package me.loki2302.notifications;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = RoomCreatedNotificationDto.class, name = "roomCreated"),
        @JsonSubTypes.Type(value = RoomUpdatedNotificationDto.class, name = "roomUpdated"),
        @JsonSubTypes.Type(value = RoomDeletedNotificationDto.class, name = "roomDeleted"),

        @JsonSubTypes.Type(value = UserJoinedRoomNotificationDto.class, name = "userJoinedRoom"),
        @JsonSubTypes.Type(value = UserLeftRoomNotificationDto.class, name = "userLeftRoom"),

        @JsonSubTypes.Type(value = MessageNotificationDto.class, name = "message"),
})
public interface NotificationDto {
}
