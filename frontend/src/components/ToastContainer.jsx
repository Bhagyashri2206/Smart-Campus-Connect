export default function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-4 bg-white rounded-xl shadow-lg border border-slate-200 animate-slide-in"
          role="alert"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-campus-100 flex items-center justify-center text-lg">
            {toast.type === 'message' ? '💬' : '📢'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800">{toast.title}</p>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{toast.body}</p>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 text-lg leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
