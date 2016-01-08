package me.loki2302.persistence;

import javax.persistence.*;

@Entity
public class Message {
    @Id
    @GeneratedValue
    public Long id;

    @ManyToOne
    public User user;

    @ManyToOne
    public Room room;

    public String text;

}
