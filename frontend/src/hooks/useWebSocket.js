import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Use relative /ws in dev (Vite proxy); set VITE_WS_URL for production builds.
const WS_URL = import.meta.env.VITE_WS_URL ?? `${window.location.origin}/ws`;

export function useWebSocket({ onMessage, onAnnouncement, onPresence, onStatusUpdate, enabled = true }) {
  const clientRef = useRef(null);
  const callbacksRef = useRef({ onMessage, onAnnouncement, onPresence, onStatusUpdate });

  useEffect(() => {
    callbacksRef.current = { onMessage, onAnnouncement, onPresence, onStatusUpdate };
  }, [onMessage, onAnnouncement, onPresence, onStatusUpdate]);

  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token || !enabled) return null;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        client.subscribe('/user/queue/messages', (frame) => {
          const data = JSON.parse(frame.body);
          callbacksRef.current.onMessage?.(data);
        });

        client.subscribe('/topic/announcements', (frame) => {
          const data = JSON.parse(frame.body);
          callbacksRef.current.onAnnouncement?.(data);
        });

        client.subscribe('/topic/presence', (frame) => {
          const data = JSON.parse(frame.body);
          callbacksRef.current.onPresence?.(data);
        });

        client.subscribe('/user/queue/status', (frame) => {
          const data = JSON.parse(frame.body);
          callbacksRef.current.onStatusUpdate?.(data);
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers.message);
      },
    });

    client.activate();
    clientRef.current = client;
    return client;
  }, [enabled]);

  useEffect(() => {
    const client = connect();
    return () => {
      if (client) {
        client.deactivate();
      }
      clientRef.current = null;
    };
  }, [connect]);

  const sendChatMessage = useCallback((receiverId, content) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ receiverId, content }),
      });
      return true;
    }
    return false;
  }, []);

  return { sendChatMessage, client: clientRef };
}
