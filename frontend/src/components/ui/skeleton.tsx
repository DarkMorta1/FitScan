import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-xl bg-muted', className)} {...props} />;
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-muted-foreground">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm text-violet-400 hover:underline">
          Try again
        </button>
      )}
    </div>
  );
}
