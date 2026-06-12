export default function MessageStatusTicks({ status }) {
  if (!status || status === 'SENT') {
    return <span className="text-[11px] text-slate-400 dark:text-slate-500 leading-none">✓</span>;
  }

  const color = status === 'READ' ? 'text-[#53bdeb]' : 'text-slate-400 dark:text-slate-500';
  return <span className={`text-[11px] ${color} leading-none`}>✓✓</span>;
}
