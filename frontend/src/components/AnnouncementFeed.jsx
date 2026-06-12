import { useState } from 'react';

export default function AnnouncementFeed({
  announcements,
  loading,
  canCreate,
  onCreate,
}) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await onCreate(title.trim(), content.trim());
      setTitle('');
      setContent('');
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Announcements</h2>
          {!canCreate && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Official campus updates (read-only)</p>
          )}
        </div>
        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1.5 text-sm font-medium text-white bg-campus-600 rounded-lg hover:bg-campus-700 transition"
          >
            + New
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-campus-600 border-t-transparent" />
          </div>
        ) : announcements.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No announcements yet</p>
        ) : (
          announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-4 bg-white dark:bg-[#202c33] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{ann.title}</h3>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {formatDate(ann.timestamp)}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 whitespace-pre-wrap">{ann.content}</p>
              <p className="text-xs text-campus-600 mt-3 font-medium">
                — {ann.createdByName || 'Faculty'}
              </p>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#202c33] rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Create Announcement</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-campus-500"
                required
              />
              <textarea
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-campus-500 resize-none"
                required
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-campus-600 rounded-lg hover:bg-campus-700 disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
