import { AlertTriangle, CheckCircle2, XCircle, Wrench, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

function IssueBadge({ severity }) {
  const config = {
    error: { icon: XCircle, className: 'bg-destructive/10 text-destructive border-destructive/20' },
    warning: { icon: AlertTriangle, className: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' },
  };
  const { icon: Icon, className } = config[severity] || config.warning;
  return (
    <Badge variant="outline" className={cn('gap-1 text-[10px]', className)}>
      <Icon className="w-3 h-3" />
      {severity}
    </Badge>
  );
}

export default function ValidationReport({ validation }) {
  if (!validation) return null;

  const { summary, issues, repairs } = validation;

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border"
      >
        <ShieldCheck className={cn('w-5 h-5', summary.errors === 0 ? 'text-accent' : 'text-yellow-400')} />
        <div className="flex gap-3 text-xs font-mono">
          <span className="text-muted-foreground">
            Issues: <span className="text-foreground font-semibold">{summary.total_issues}</span>
          </span>
          <span className="text-destructive">
            Errors: <span className="font-semibold">{summary.errors}</span>
          </span>
          <span className="text-yellow-400">
            Warnings: <span className="font-semibold">{summary.warnings}</span>
          </span>
          <span className="text-accent">
            Repairs: <span className="font-semibold">{summary.repairs_applied}</span>
          </span>
          <span className="text-muted-foreground">
            Layers: <span className="text-foreground font-semibold">{summary.layers_validated}</span>
          </span>
        </div>
      </motion.div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detected Issues</h4>
          <div className="space-y-1">
            {issues.slice(0, 10).map((issue, idx) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-2 p-2 rounded bg-card border border-border text-xs"
              >
                <IssueBadge severity={issue.severity} />
                <span className="text-foreground/80 font-mono flex-1">{issue.message}</span>
              </motion.div>
            ))}
            {issues.length > 10 && (
              <p className="text-xs text-muted-foreground pl-2">+ {issues.length - 10} more issues</p>
            )}
          </div>
        </div>
      )}

      {/* Repairs */}
      {repairs.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Applied Repairs</h4>
          <div className="space-y-1">
            {repairs.map((repair, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-2 p-2 rounded bg-accent/5 border border-accent/20 text-xs"
              >
                <Wrench className="w-3 h-3 text-accent shrink-0" />
                <span className="text-accent/80 font-mono">{repair.description}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Passed state */}
      {summary.errors === 0 && issues.length === 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/5 border border-accent/20">
          <CheckCircle2 className="w-5 h-5 text-accent" />
          <span className="text-sm text-accent font-medium">All validations passed</span>
        </div>
      )}
    </div>
  );
}
