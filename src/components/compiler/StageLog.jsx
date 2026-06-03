import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { STAGE_STATUS } from '@/lib/pipelineStages';
import { Clock } from 'lucide-react';

const statusText = {
  [STAGE_STATUS.RUNNING]: 'Processing...',
  [STAGE_STATUS.COMPLETED]: 'Completed',
  [STAGE_STATUS.FAILED]: 'Failed',
  [STAGE_STATUS.REPAIRED]: 'Repaired',
};

const statusColor = {
  [STAGE_STATUS.RUNNING]: 'text-primary',
  [STAGE_STATUS.COMPLETED]: 'text-accent',
  [STAGE_STATUS.FAILED]: 'text-destructive',
  [STAGE_STATUS.REPAIRED]: 'text-yellow-400',
};

export default function StageLog({ logs }) {
  if (!logs || logs.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-3 py-2 border-b border-border bg-muted/30 flex items-center gap-2">
        <Clock className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs font-mono font-medium text-muted-foreground">Pipeline Log</span>
      </div>
      <div className="p-3 max-h-[200px] overflow-auto font-mono text-xs space-y-1">
        <AnimatePresence mode="popLayout">
          {logs.map((log, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <span className="text-muted-foreground w-20 shrink-0">[{log.time}]</span>
              <span className={cn(
                'w-16 shrink-0 uppercase text-[10px] font-semibold',
                statusColor[log.status] || 'text-muted-foreground'
              )}>
                {statusText[log.status] || log.status}
              </span>
              <span className="text-foreground/70">{log.stage}</span>
              {log.error && <span className="text-destructive ml-2">— {log.error}</span>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
