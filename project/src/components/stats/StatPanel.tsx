/** Shared bordered panel used across the Stats tab for visual consistency. */
export function StatPanel({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-white/10 bg-[#0d1622] p-5 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
