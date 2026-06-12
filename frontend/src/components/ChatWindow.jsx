import { useState, useRef, useEffect } from 'react';
import MessageStatusTicks from './MessageStatusTicks';

export default function ChatWindow({ selectedUser, messages, loading, currentUserId, onSendMessage }) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser || sending) return;

    setSending(true);
    try {
      await onSendMessage(selectedUser.id, input.trim());
      setInput('');
    } finally {
      setSending(false);
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center chat-wallpaper">
        <div className="text-center p-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur shadow-lg border border-slate-200/50 dark:border-slate-700/50">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-campus-500 to-campus-700 flex items-center justify-center shadow-lg">
            <span className="text-4xl">🏫</span>
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Smart Campus Connect</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Select a contact to start messaging</p>
        </div>
      </div>
    );
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#efeae2] dark:bg-[#0b141a]">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div className="relative">
          {selectedUser.profilePicUrl ? (
            <img
              src={selectedUser.profilePicUrl}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-campus-500 to-campus-700 flex items-center justify-center font-semibold text-white">
              {selectedUser.name.charAt(0).toUpperCase()}
            </div>
          )}
          {selectedUser.onlineStatus && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#f0f2f5] dark:border-[#202c33] rounded-full" />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{selectedUser.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {selectedUser.onlineStatus ? (
              <span className="text-green-600 dark:text-green-400">online</span>
            ) : (
              'offline'
            )}
            {' · '}{selectedUser.department || selectedUser.role}
          </p>
          {selectedUser.statusMessage && (
            <p className="text-[11px] italic text-slate-400 dark:text-slate-500 truncate">
              {selectedUser.statusMessage}
            </p>
          )}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5 scrollbar-thin chat-wallpaper scroll-smooth"
      >
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-campus-600 border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm py-8">No messages yet. Say hello! 👋</p>
        ) : (
          messages.map((msg) => {
            const isOwn = Number(msg.senderId) === Number(currentUserId);
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div
                  className={`relative max-w-[78%] sm:max-w-[65%] px-3 py-2 shadow-sm ${
                    isOwn
                      ? 'bg-[#d9fdd3] dark:bg-[#005c4b] rounded-lg rounded-tr-none'
                      : 'bg-white dark:bg-[#202c33] rounded-lg rounded-tl-none'
                  }`}
                >
                  <p className="text-[14.5px] leading-relaxed text-slate-800 dark:text-slate-100 break-words pr-1">
                    {msg.content}
                  </p>
                  <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{formatTime(msg.timestamp)}</span>
                    {isOwn && <MessageStatusTicks status={msg.status} />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="flex gap-2 p-3 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-slate-200/80 dark:border-slate-700/80">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
          className="flex-1 px-4 py-2.5 rounded-lg bg-white dark:bg-[#2a3942] border-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-campus-500/50"
        />
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={!input.trim() || sending}
          className="px-5 py-2.5 bg-campus-600 hover:bg-campus-700 text-white rounded-lg font-medium disabled:opacity-50 transition shadow-sm"
        >
          {sending ? '…' : 'Send'}
        </button>
      </form>
    </div>
  );
}
