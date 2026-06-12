import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ProfileCard from './ProfileCard';
import EditProfile from './EditProfile';

export default function Sidebar({ activeTab, onTabChange, onLogout, unreadTotal = 0 }) {
  const { user, updateProfile } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [showEditProfile, setShowEditProfile] = useState(false);

  const tabs = [
    { id: 'chat', label: 'Messages', icon: '💬' },
    { id: 'announcements', label: 'Announcements', icon: '📢' },
  ];

  const handleSaveProfile = async (profileData) => {
    await updateProfile(profileData);
  };

  return (
    <>
      <aside className="w-16 lg:w-56 bg-campus-900 dark:bg-slate-900 text-white flex flex-col shrink-0 border-r border-campus-800 dark:border-slate-800">
        <div className="p-3 border-b border-campus-800 dark:border-slate-800">
          <div className="hidden lg:block mb-3">
            <h1 className="text-sm font-bold leading-tight px-1">Smart Campus</h1>
            <p className="text-[10px] text-campus-300 dark:text-slate-400 px-1">Connect</p>
          </div>
          <div className="lg:hidden text-center text-xl py-1">🏫</div>
          <div className="hidden lg:block mt-2">
            <ProfileCard user={user} onEdit={() => setShowEditProfile(true)} />
          </div>
          <div className="lg:hidden flex justify-center mt-1">
            <ProfileCard user={user} onEdit={() => setShowEditProfile(true)} compact />
          </div>
        </div>

        <nav className="flex-1 py-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative w-full flex items-center gap-3 px-4 py-3 transition ${
                activeTab === tab.id
                  ? 'bg-campus-700 dark:bg-slate-800 border-r-4 border-white'
                  : 'hover:bg-campus-800 dark:hover:bg-slate-800/70'
              }`}
            >
              <span className="text-lg relative">
                {tab.icon}
                {tab.id === 'chat' && unreadTotal > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full px-1">
                    {unreadTotal > 99 ? '99+' : unreadTotal}
                  </span>
                )}
              </span>
              <span className="hidden lg:inline text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-campus-800 dark:border-slate-800 space-y-2">
          <button
            onClick={toggleDarkMode}
            className="w-full py-2 text-xs font-medium bg-campus-800 dark:bg-slate-800 hover:bg-campus-700 dark:hover:bg-slate-700 rounded-lg transition flex items-center justify-center gap-2"
            title="Toggle dark mode"
          >
            <span>{darkMode ? '☀️' : '🌙'}</span>
            <span className="hidden lg:inline">{darkMode ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full py-2 text-xs font-medium bg-campus-800 dark:bg-slate-800 hover:bg-red-600 rounded-lg transition"
          >
            <span className="lg:hidden">⏻</span>
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
      </aside>

      {showEditProfile && (
        <EditProfile
          user={user}
          onSave={handleSaveProfile}
          onClose={() => setShowEditProfile(false)}
        />
      )}
    </>
  );
}
