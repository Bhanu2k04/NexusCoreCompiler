import { PIPELINE_STAGES, STAGE_STATUS } from '@/lib/pipelineStages';
import { Brain, Network, FileJson, ShieldCheck, Play, Loader2, Check, X, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const iconMap = {
  Brain, Network, FileJson, ShieldCheck, Play,
};

const statusConfig = {
  [STAGE_STATUS.PENDING]: { color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border', pulse: false },
  [STAGE_STATUS.RUNNING]: { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/50', pulse: true },
  [STAGE_STATUS.COMPLETED]: { color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/50', pulse: false },
  [STAGE_STATUS.FAILED]: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/50', pulse: false },
  [STAGE_STATUS.REPAIRED]: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/50', pulse: false },
};

function StatusIcon({ status }) {
  if (status === STAGE_STATUS.RUNNING) return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
  if (status === STAGE_STATUS.COMPLETED) return <Check className="w-4 h-4 text-accent" />;
  if (status === STAGE_STATUS.FAILED) return <X className="w-4 h-4 text-destructive" />;
  if (status === STAGE_STATUS.REPAIRED) return <Wrench className="w-4 h-4 text-yellow-400" />;
  return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />;
}

export default function PipelineVisualizer({ stages }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {PIPELINE_STAGES.map((stage, idx) => {
        const status = stages[stage.id]?.status || STAGE_STATUS.PENDING;
        const config = statusConfig[status];
        const Icon = iconMap[stage.icon];

        return (
          <div key={stage.id} className="flex items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 min-w-fit',
                config.bg, config.border,
                config.pulse && 'animate-pulse'
              )}
            >
              {Icon && <Icon className={cn('w-4 h-4 shrink-0', config.color)} />}
              <span className={cn('text-xs font-medium whitespace-nowrap', config.color)}>
                {stage.name}
              </span>
              <StatusIcon status={status} />
            </motion.div>
            {idx < PIPELINE_STAGES.length - 1 && (
              <div className={cn(
                'w-6 h-px mx-1 shrink-0',
                status === STAGE_STATUS.COMPLETED || status === STAGE_STATUS.REPAIRED ? 'bg-accent/50' : 'bg-border'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
