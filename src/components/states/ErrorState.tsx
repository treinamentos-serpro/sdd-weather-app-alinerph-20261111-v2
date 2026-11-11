interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="py-4 text-white">
      <p role="alert" className="break-words text-sm text-red-200">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium backdrop-blur-md hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
      >
        Tentar novamente
      </button>
    </div>
  );
}