package me.loki2302.persistence;

import javax.persistence.*;

@Entity
public class Room {
    @Id
    @GeneratedValue
    public Long id;
    public String name;
}
