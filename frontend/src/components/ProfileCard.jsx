export default function ProfileCard({ user, onEdit, compact = false }) {
  if (!user) return null;

  const initials = user.name?.charAt(0)?.toUpperCase() || '?';
  const avatarUrl = user.profilePicUrl;

  if (compact) {
    return (
      <button
        type="button"
        onClick={onEdit}
        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-campus-800/60 dark:hover:bg-slate-800 transition text-left"
      >
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-campus-600" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-campus-500 to-campus-700 flex items-center justify-center text-sm font-bold">
              {initials}
            </div>
          )}
          <span
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-campus-900 dark:border-slate-900 ${
              user.onlineStatus ? 'bg-green-500' : 'bg-slate-400'
            }`}
          />
        </div>
        <div className="min-w-0 flex-1 hidden lg:block">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-[10px] text-campus-300 dark:text-slate-400 truncate">{user.department}</p>
        </div>
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center text-center p-4 rounded-xl bg-campus-800/40 dark:bg-slate-800/60 border border-campus-700/50 dark:border-slate-700">
      <div className="relative mb-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-white/20 shadow-lg"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-campus-400 to-campus-700 flex items-center justify-center text-2xl font-bold shadow-lg">
            {initials}
          </div>
        )}
        <span
          className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-campus-800 ${
            user.onlineStatus ? 'bg-green-500' : 'bg-slate-400'
          }`}
          title={user.onlineStatus ? 'Online' : 'Offline'}
        />
      </div>
      <h3 className="font-semibold text-white text-sm">{user.name}</h3>
      <p className="text-xs text-campus-200 dark:text-slate-300 mt-0.5">{user.department}</p>
      <p className="text-[10px] text-campus-300 dark:text-slate-400 uppercase tracking-wide mt-1">{user.role}</p>
      {user.statusMessage && (
        <p className="text-xs italic text-campus-100 dark:text-slate-300 mt-2 px-2 line-clamp-2">
          &ldquo;{user.statusMessage}&rdquo;
        </p>
      )}
      <p className="text-[10px] mt-2 text-campus-300">
        {user.onlineStatus ? (
          <span className="text-green-400">● Online</span>
        ) : (
          <span className="text-slate-400">○ Offline</span>
        )}
      </p>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="mt-3 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition"
        >
          Edit profile
        </button>
      )}
    </div>
  );
}
