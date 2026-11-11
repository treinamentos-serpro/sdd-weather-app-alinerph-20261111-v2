interface EmptyStateProps {
  title: string;
  hint: string;
}

export default function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <div role="status" className="py-4 text-white">
      <p className="break-words font-medium">{title}</p>
      <p className="mt-1 break-words text-sm text-white/80">{hint}</p>
    </div>
  );
}