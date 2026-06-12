import { useState, useCallback } from 'react';
import { messageApi } from '../api/messageApi';

export function useChat(currentUserId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadConversation = useCallback(async (user) => {
    if (!user) return;
    setSelectedUser(user);
    setLoading(true);
    try {
      const { data } = await messageApi.getConversation(user.id);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const appendMessage = useCallback((message) => {
    setMessages((prev) => {
      const exists = prev.some((m) => m.id === message.id);
      if (exists) return prev;
      return [...prev, message];
    });
  }, []);

  const updateMessageStatus = useCallback((messageId, status) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, status } : m))
    );
  }, []);

  const sendViaRest = useCallback(async (receiverId, content) => {
    const { data } = await messageApi.send(receiverId, content);
    appendMessage(data);
    return data;
  }, [appendMessage]);

  const clearChat = useCallback(() => {
    setSelectedUser(null);
    setMessages([]);
  }, []);

  return {
    messages,
    loading,
    selectedUser,
    setSelectedUser,
    loadConversation,
    appendMessage,
    updateMessageStatus,
    sendViaRest,
    clearChat,
  };
}
