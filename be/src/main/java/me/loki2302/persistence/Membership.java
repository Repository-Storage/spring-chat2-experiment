package me.loki2302.persistence;

import javax.persistence.*;

@Entity
@IdClass(MembershipId.class)
public class Membership {
    @Id
    @Column(name = "user_id")
    public Long userId;

    @Id
    @Column(name = "room_id")
    public Long roomId;

    @ManyToOne
    @JoinColumn(name = "user_id", updatable = false, insertable = false)
    public User user;

    @ManyToOne
    @JoinColumn(name = "room_id", updatable = false, insertable = false)
    public Room room;
}
