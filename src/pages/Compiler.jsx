import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Code2, Download, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import PromptInput from '@/components/compiler/PromptInput';
import PipelineVisualizer from '@/components/compiler/PipelineVisualizer';
import StageLog from '@/components/compiler/StageLog';
import OutputTabs from '@/components/compiler/OutputTabs';
import { runPipeline } from '@/lib/compiler';
import { PIPELINE_STAGES } from '@/lib/pipelineStages';

export default function Compiler() {
  const [isRunning, setIsRunning] = useState(false);
  const [stages, setStages] = useState({});
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const logRef = useRef([]);

  const addLog = useCallback((stageId, status, error) => {
    const now = new Date();
    const time = `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const stageName = PIPELINE_STAGES.find(s => s.id === stageId)?.name || stageId;
    const newLog = { time, stage: stageName, status, error };
    logRef.current = [...logRef.current, newLog];
    setLogs([...logRef.current]);
  }, []);

  const handleCompile = useCallback(async (prompt) => {
    setIsRunning(true);
    setStages({});
    setResult(null);
    logRef.current = [];
    setLogs([]);

    const pipelineResult = await runPipeline(prompt, (stageId, status, data, error) => {
      setStages(prev => ({ ...prev, [stageId]: { status, data, error } }));
      addLog(stageId, status, error);
    });

    setResult(pipelineResult);
    setIsRunning(false);

    if (pipelineResult.execution?.executable) {
      toast.success('Compilation successful — output is executable');
    } else {
      toast.info('Compilation complete — review results below');
    }
  }, [addLog]);

  const handleDownload = () => {
    if (!result?.output) return;
    const blob = new Blob([JSON.stringify(result.output, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold font-mono text-foreground tracking-tight">AppCompiler</h1>
              <p className="text-[10px] text-muted-foreground font-mono">Natural Language → Validated App Config</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/evaluation">
              <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-foreground">
                <FlaskConical className="w-3 h-3" />
                Evaluation
              </Button>
            </Link>
            {result?.output && (
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2 text-xs">
                <Download className="w-3 h-3" />
                Export JSON
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Input */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PromptInput onSubmit={handleCompile} isRunning={isRunning} />
        </motion.section>

        {/* Pipeline */}
        {Object.keys(stages).length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <PipelineVisualizer stages={stages} />
            <StageLog logs={logs} />
          </motion.section>
        )}

        {/* Output */}
        {result && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <OutputTabs result={result} />
          </motion.section>
        )}
      </main>
    </div>
  );
}
