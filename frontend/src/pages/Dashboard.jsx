import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { userApi } from '../api/userApi';
import { announcementApi } from '../api/announcementApi';
import { messageApi } from '../api/messageApi';
import { useWebSocket } from '../hooks/useWebSocket';
import { useChat } from '../hooks/useChat';
import Sidebar from '../components/Sidebar';
import UserList from '../components/UserList';
import ChatWindow from '../components/ChatWindow';
import AnnouncementFeed from '../components/AnnouncementFeed';
import NotificationPanel from '../components/NotificationPanel';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { addNotification, notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('chat');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadByUser, setUnreadByUser] = useState({});

  const {
    messages,
    loading: chatLoading,
    selectedUser,
    setSelectedUser,
    loadConversation,
    appendMessage,
    updateMessageStatus,
    sendViaRest,
    clearChat,
  } = useChat(user?.id);

  const totalUnread = Object.values(unreadByUser).reduce((sum, n) => sum + n, 0);

  const fetchUnreadCounts = useCallback(async () => {
    try {
      const { data } = await messageApi.getUnreadCounts();
      setUnreadByUser(data.countsByUser || {});
    } catch (err) {
      console.error('Failed to fetch unread counts:', err);
    }
  }, []);

  const fetchUsers = useCallback(async (search = '', role = null) => {
    setUsersLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (role) params.role = role;
      const { data } = await userApi.getAll(params);
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    setAnnouncementsLoading(true);
    try {
      const { data } = await announcementApi.getAll();
      setAnnouncements(data);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    } finally {
      setAnnouncementsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchAnnouncements();
    fetchUnreadCounts();
  }, [fetchUsers, fetchAnnouncements, fetchUnreadCounts]);

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleIncomingMessage = useCallback(
    (message) => {
      const currentUserId = Number(user?.id);
      const senderId = Number(message.senderId);
      const receiverId = Number(message.receiverId);
      const isIncoming = senderId !== currentUserId;

      const isForCurrentChat =
        selectedUser &&
        (senderId === Number(selectedUser.id) || receiverId === Number(selectedUser.id));

      if (isForCurrentChat) {
        appendMessage(message);
      }

      if (isIncoming) {
        if (message.status === 'SENT' && message.id) {
          messageApi.markAsDelivered(message.id).catch(() => {});
        }

        if (!isForCurrentChat) {
          setUnreadByUser((prev) => ({
            ...prev,
            [senderId]: (prev[senderId] || 0) + 1,
          }));
        }

        const isChatFocused = isForCurrentChat && document.hasFocus();
        if (!isChatFocused) {
          addNotification({
            type: 'message',
            title: `New message from ${message.senderName || 'User'}`,
            body: message.content,
            senderId,
          });
        }
      }
    },
    [selectedUser, appendMessage, addNotification, user?.id]
  );

  const handleStatusUpdate = useCallback(
    (update) => {
      updateMessageStatus(update.id, update.status);
    },
    [updateMessageStatus]
  );

  const handleIncomingAnnouncement = useCallback(
    (announcement) => {
      setAnnouncements((prev) => {
        const exists = prev.some((a) => a.id === announcement.id);
        if (exists) return prev;
        return [announcement, ...prev];
      });
      addNotification({
        type: 'announcement',
        title: `New announcement: ${announcement.title}`,
        body: announcement.content,
      });
    },
    [addNotification]
  );

  const handlePresence = useCallback((data) => {
    const userId = Number(data.userId);
    setUsers((prev) =>
      prev.map((u) =>
        Number(u.id) === userId ? { ...u, onlineStatus: data.online } : u
      )
    );
    if (Number(selectedUser?.id) === userId) {
      setSelectedUser((prev) => (prev ? { ...prev, onlineStatus: data.online } : prev));
    }
  }, [selectedUser?.id, setSelectedUser]);

  const { sendChatMessage } = useWebSocket({
    onMessage: handleIncomingMessage,
    onAnnouncement: handleIncomingAnnouncement,
    onPresence: handlePresence,
    onStatusUpdate: handleStatusUpdate,
    enabled: !!user,
  });

  const handleSendMessage = async (receiverId, content) => {
    const sentViaWs = sendChatMessage(receiverId, content);
    if (!sentViaWs) {
      await sendViaRest(receiverId, content);
    }
  };

  const handleSelectUser = (selected) => {
    loadConversation(selected);
    setActiveTab('chat');
    setUnreadByUser((prev) => {
      const next = { ...prev };
      delete next[selected.id];
      return next;
    });
  };

  const handleSearch = (search, role) => {
    setSearchQuery(search);
    setRoleFilter(role);
    fetchUsers(search, role);
  };

  const handleCreateAnnouncement = async (title, content) => {
    const { data } = await announcementApi.create(title, content);
    setAnnouncements((prev) => [data, ...prev]);
    addNotification({
      type: 'announcement',
      title: 'Announcement published',
      body: title,
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const canCreateAnnouncement = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  const handleOpenChatFromNotification = useCallback(
    (senderId) => {
      const sender = users.find((u) => u.id === senderId);
      if (sender) {
        handleSelectUser(sender);
        setNotifOpen(false);
      }
    },
    [users]
  );

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} unreadTotal={totalUnread} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#202c33] border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {activeTab === 'chat' ? 'Messages' : 'Announcements'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user?.role} · {user?.department}
            </p>
          </div>
          <NotificationPanel
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkRead={markAsRead}
            onMarkAllRead={markAllAsRead}
            isOpen={notifOpen}
            onToggle={() => setNotifOpen(!notifOpen)}
            onOpenChat={handleOpenChatFromNotification}
          />
        </header>

        <div className="flex-1 flex min-h-0">
          {activeTab === 'chat' ? (
            <>
              <div className="w-full sm:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111b21] shrink-0 flex flex-col">
                {usersLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-campus-600 border-t-transparent" />
                  </div>
                ) : (
                  <UserList
                    users={users}
                    selectedUser={selectedUser}
                    onSelectUser={handleSelectUser}
                    onSearch={handleSearch}
                    searchQuery={searchQuery}
                    roleFilter={roleFilter}
                    onRoleFilter={setRoleFilter}
                    unreadByUser={unreadByUser}
                  />
                )}
              </div>
              <div className="flex-1 flex flex-col min-w-0 hidden sm:flex">
                <ChatWindow
                  selectedUser={selectedUser}
                  messages={messages}
                  loading={chatLoading}
                  currentUserId={user?.id}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 bg-slate-50 dark:bg-[#0b141a]">
              <AnnouncementFeed
                announcements={announcements}
                loading={announcementsLoading}
                canCreate={canCreateAnnouncement}
                onCreate={handleCreateAnnouncement}
              />
            </div>
          )}
        </div>
      </div>

      {activeTab === 'chat' && selectedUser && (
        <div className="sm:hidden fixed inset-0 top-14 z-30 flex flex-col bg-[#efeae2] dark:bg-[#0b141a]">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-[#f0f2f5] dark:bg-[#202c33] text-slate-800 dark:text-slate-100">
            <button onClick={clearChat} className="p-1">
              ← Back
            </button>
            <span className="font-medium">{selectedUser.name}</span>
          </div>
          <ChatWindow
            selectedUser={selectedUser}
            messages={messages}
            loading={chatLoading}
            currentUserId={user?.id}
            onSendMessage={handleSendMessage}
          />
        </div>
      )}
    </div>
  );
}
