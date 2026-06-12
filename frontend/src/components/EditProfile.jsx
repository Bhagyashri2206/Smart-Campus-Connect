import { useState } from 'react';

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MBA', 'MCA', 'Computer Science', 'Information Technology'];

const STATUS_PRESETS = ['Available', 'Busy', 'In class', 'At library', 'Do not disturb'];

export default function EditProfile({ user, onSave, onClose }) {
  const [form, setForm] = useState({
    department: user?.department || 'CSE',
    statusMessage: user?.statusMessage || '',
    profilePicUrl: user?.profilePicUrl || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave({
        department: form.department,
        statusMessage: form.statusMessage.trim() || null,
        profilePicUrl: form.profilePicUrl.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#202c33] rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-[#f0f2f5] dark:bg-[#111b21]">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Edit Profile</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Update your campus profile</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Profile picture URL
            </label>
            <input
              name="profilePicUrl"
              type="url"
              value={form.profilePicUrl}
              onChange={handleChange}
              placeholder="https://example.com/photo.jpg"
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-[#2a3942] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-campus-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-[#2a3942] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-campus-500"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status message</label>
            <input
              name="statusMessage"
              type="text"
              value={form.statusMessage}
              onChange={handleChange}
              placeholder="e.g. In class, Available"
              maxLength={120}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-[#2a3942] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-campus-500"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {STATUS_PRESETS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, statusMessage: s }))}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-campus-100 dark:hover:bg-campus-900/40"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-campus-600 hover:bg-campus-700 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
