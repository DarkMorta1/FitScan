import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
        variant === 'default' && 'border-violet-500/30 bg-violet-500/20 text-violet-300',
        variant === 'success' && 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400',
        variant === 'warning' && 'border-amber-500/30 bg-amber-500/20 text-amber-400',
        variant === 'danger' && 'border-red-500/30 bg-red-500/20 text-red-400',
        variant === 'outline' && 'border-border text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}
