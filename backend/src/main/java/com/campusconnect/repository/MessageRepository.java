package com.campusconnect.repository;

import com.campusconnect.model.Message;
import com.campusconnect.model.MessageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE " +
           "(m.senderId = :userId1 AND m.receiverId = :userId2) OR " +
           "(m.senderId = :userId2 AND m.receiverId = :userId1) " +
           "ORDER BY m.timestamp ASC")
    List<Message> findConversation(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    @Query("SELECT m.senderId, COUNT(m) FROM Message m WHERE m.receiverId = :receiverId " +
           "AND m.status <> :readStatus GROUP BY m.senderId")
    List<Object[]> countUnreadGroupedBySender(
            @Param("receiverId") Long receiverId,
            @Param("readStatus") MessageStatus readStatus);

    long countByReceiverIdAndSenderIdAndStatusNot(
            Long receiverId, Long senderId, MessageStatus status);
}
