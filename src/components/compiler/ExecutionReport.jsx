import { CheckCircle2, XCircle, Zap, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function ExecutionReport({ execution }) {
  if (!execution) return null;

  return (
    <div className="space-y-4">
      {/* Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border"
      >
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="3"
            />
            <motion.path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={execution.executable ? 'hsl(var(--accent))' : 'hsl(var(--destructive))'}
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 100' }}
              animate={{ strokeDasharray: `${execution.percentage} 100` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              'text-sm font-bold font-mono',
              execution.executable ? 'text-accent' : 'text-destructive'
            )}>
              {execution.percentage}%
            </span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            {execution.executable ? (
              <Zap className="w-5 h-5 text-accent" />
            ) : (
              <Activity className="w-5 h-5 text-destructive" />
            )}
            <h3 className={cn(
              'text-lg font-bold',
              execution.executable ? 'text-accent' : 'text-destructive'
            )}>
              {execution.executable ? 'Executable' : 'Not Executable'}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {execution.score}/{execution.max_score} checks passed
          </p>
        </div>
      </motion.div>

      {/* Checks */}
      <div className="space-y-1">
        {execution.checks.map((check, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center gap-3 p-2 rounded text-xs font-mono"
          >
            {check.passed ? (
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive shrink-0" />
            )}
            <span className={cn(
              'flex-1',
              check.passed ? 'text-foreground/80' : 'text-destructive/80'
            )}>
              {check.name}
            </span>
            <span className="text-muted-foreground">{check.detail}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
