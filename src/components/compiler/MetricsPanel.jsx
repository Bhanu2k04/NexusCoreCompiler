import { Clock, Cpu, RotateCcw, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

function MetricCard({ icon: Icon, label, value, unit }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
    >
      <div className="p-2 rounded-md bg-primary/10">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
        <p className="text-sm font-mono font-bold text-foreground">
          {value}{unit && <span className="text-muted-foreground font-normal ml-1">{unit}</span>}
        </p>
      </div>
    </motion.div>
  );
}

export default function MetricsPanel({ metrics }) {
  if (!metrics) return null;

  const stageTimeEntries = Object.entries(metrics.stage_times || {});

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <MetricCard icon={Clock} label="Total Time" value={(metrics.total_time_ms / 1000).toFixed(1)} unit="s" />
        <MetricCard icon={Cpu} label="LLM Calls" value={metrics.llm_calls} />
        <MetricCard icon={RotateCcw} label="Retries" value={metrics.retries} />
        <MetricCard icon={Layers} label="Stages" value={stageTimeEntries.length} />
      </div>

      {stageTimeEntries.length > 0 && (
        <div className="p-3 rounded-lg bg-card border border-border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Stage Latency</p>
          <div className="space-y-1.5">
            {stageTimeEntries.map(([stage, ms]) => {
              const maxMs = Math.max(...stageTimeEntries.map(([, v]) => v));
              const pct = maxMs > 0 ? (ms / maxMs) * 100 : 0;
              return (
                <div key={stage} className="flex items-center gap-2 text-xs font-mono">
                  <span className="w-20 text-muted-foreground truncate">{stage}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-primary/60 rounded-full"
                    />
                  </div>
                  <span className="w-14 text-right text-muted-foreground">{(ms / 1000).toFixed(1)}s</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
