package me.loki2302.notifications;

public class MessageNotificationDto implements NotificationDto {
    public long userId;
    public String username;
    public long roomId;
    public String roomName;
    public long messageId;
    public String messageText;
}
