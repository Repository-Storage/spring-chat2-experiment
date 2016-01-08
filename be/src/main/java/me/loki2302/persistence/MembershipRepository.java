package me.loki2302.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MembershipRepository extends JpaRepository<Membership, MembershipId> {
    List<Membership> findByRoom(Room room);
    List<Membership> findByUser(User user);
    Membership findByRoomAndUser(Room room, User user);
}
