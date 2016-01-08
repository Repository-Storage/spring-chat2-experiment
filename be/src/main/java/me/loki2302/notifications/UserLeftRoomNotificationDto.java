package me.loki2302.notifications;

public class UserLeftRoomNotificationDto implements NotificationDto {
    public long userId;
    public String username;
    public long roomId;
    public String roomName;
}
