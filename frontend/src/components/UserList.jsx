import { useState } from 'react';

const ROLE_COLORS = {
  STUDENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  TEACHER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  ADMIN: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

export default function UserList({ users, selectedUser, onSelectUser, onSearch, searchQuery, roleFilter, onRoleFilter, unreadByUser = {} }) {
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(localSearch, roleFilter);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111b21]">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Chats</h2>
        <form onSubmit={handleSearch} className="space-y-2">
          <input
            type="text"
            placeholder="Search users..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-[#2a3942] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-campus-500"
          />
          <select
            value={roleFilter || ''}
            onChange={(e) => onRoleFilter(e.target.value || null)}
            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-[#2a3942] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-campus-500"
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="TEACHER">Teachers</option>
            <option value="ADMIN">Admins</option>
          </select>
          <button
            type="submit"
            className="w-full py-2 text-sm font-medium text-white bg-campus-600 rounded-lg hover:bg-campus-700 transition"
          >
            Search
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {users.length === 0 ? (
          <p className="p-4 text-sm text-slate-500 text-center">No users found</p>
        ) : (
          users.map((user) => {
            const unread = unreadByUser[user.id] || 0;
            return (
            <button
              key={user.id}
              onClick={() => onSelectUser(user)}
              className={`w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-[#202c33] transition text-left border-b border-slate-100 dark:border-slate-800 ${
                selectedUser?.id === user.id ? 'bg-campus-50 dark:bg-[#2a3942] border-l-4 border-l-campus-600' : ''
              }`}
            >
              <div className="relative">
                {user.profilePicUrl ? (
                  <img src={user.profilePicUrl} alt="" className="w-11 h-11 rounded-full object-cover" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-campus-500 to-campus-700 flex items-center justify-center text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {user.onlineStatus && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#111b21] rounded-full" />
                )}
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full px-1">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${unread > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user.statusMessage ? (
                    <span className="italic">{user.statusMessage}</span>
                  ) : (
                    user.department
                  )}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${ROLE_COLORS[user.role] || 'bg-slate-100'}`}>
                {user.role}
              </span>
            </button>
            );
          })
        )}
      </div>
    </div>
  );
}
