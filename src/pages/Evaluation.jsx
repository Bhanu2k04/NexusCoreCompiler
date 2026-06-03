import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, CheckCircle2, XCircle, Loader2, Clock, AlertTriangle, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ALL_PROMPTS } from '@/lib/evaluationDataset';
import { runPipeline } from '@/lib/compiler';

const categoryColors = {
  real: 'bg-primary/10 text-primary border-primary/20',
  vague: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  conflicting: 'bg-destructive/10 text-destructive border-destructive/20',
  incomplete: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  complex: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  invalid: 'bg-muted text-muted-foreground border-border',
  ambiguous: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
};

export default function Evaluation() {
  const [results, setResults] = useState({});
  const [running, setRunning] = useState(null);
  const [batchRunning, setBatchRunning] = useState(false);

  const runSingle = async (promptObj) => {
    setRunning(promptObj.id);
    setResults(prev => ({ ...prev, [promptObj.id]: { status: 'running' } }));

    const result = await runPipeline(promptObj.prompt, () => {});

    setResults(prev => ({
      ...prev,
      [promptObj.id]: {
        status: result.execution?.executable ? 'success' : 'partial',
        result,
        time: result.metrics.total_time_ms,
        retries: result.metrics.retries,
        llmCalls: result.metrics.llm_calls,
        executable: result.execution?.executable || false,
        score: result.execution?.percentage || 0,
      },
    }));
    setRunning(null);
  };

  const runBatch = async () => {
    setBatchRunning(true);
    for (const prompt of ALL_PROMPTS) {
      if (!results[prompt.id] || results[prompt.id].status === 'running') {
        await runSingle(prompt);
      }
    }
    setBatchRunning(false);
  };

  const completedResults = Object.values(results).filter(r => r.status !== 'running');
  const successCount = completedResults.filter(r => r.executable).length;
  const avgTime = completedResults.length > 0
    ? (completedResults.reduce((s, r) => s + (r.time || 0), 0) / completedResults.length / 1000).toFixed(1)
    : 0;
  const totalRetries = completedResults.reduce((s, r) => s + (r.retries || 0), 0);
  const avgScore = completedResults.length > 0
    ? Math.round(completedResults.reduce((s, r) => s + (r.score || 0), 0) / completedResults.length)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-sm font-bold font-mono text-foreground">Evaluation Framework</h1>
              <p className="text-[10px] text-muted-foreground font-mono">20 test prompts — 10 real + 10 edge cases</p>
            </div>
          </div>
          <Button
            onClick={runBatch}
            disabled={batchRunning}
            className="gap-2 text-xs"
          >
            {batchRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            Run All Tests
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Aggregate Metrics */}
        {completedResults.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="bg-card border-border">
              <CardContent className="p-3">
                <p className="text-[10px] uppercase text-muted-foreground font-mono">Completed</p>
                <p className="text-xl font-bold font-mono">{completedResults.length}/{ALL_PROMPTS.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-3">
                <p className="text-[10px] uppercase text-muted-foreground font-mono">Success Rate</p>
                <p className="text-xl font-bold font-mono text-accent">
                  {completedResults.length > 0 ? Math.round((successCount / completedResults.length) * 100) : 0}%
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-3">
                <p className="text-[10px] uppercase text-muted-foreground font-mono">Avg Latency</p>
                <p className="text-xl font-bold font-mono">{avgTime}s</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-3">
                <p className="text-[10px] uppercase text-muted-foreground font-mono">Total Retries</p>
                <p className="text-xl font-bold font-mono">{totalRetries}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-3">
                <p className="text-[10px] uppercase text-muted-foreground font-mono">Avg Score</p>
                <p className="text-xl font-bold font-mono">{avgScore}%</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Test Cases */}
        <div className="space-y-2">
          {ALL_PROMPTS.map((promptObj, idx) => {
            const res = results[promptObj.id];
            const isRunningThis = running === promptObj.id;

            return (
              <motion.div
                key={promptObj.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
              >
                <Card className="bg-card border-border">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      {/* Status */}
                      <div className="mt-0.5">
                        {isRunningThis ? (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        ) : res?.executable ? (
                          <CheckCircle2 className="w-4 h-4 text-accent" />
                        ) : res?.status === 'partial' ? (
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        ) : res?.status ? (
                          <XCircle className="w-4 h-4 text-destructive" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-border" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold font-mono">{promptObj.name}</span>
                          <Badge variant="outline" className={cn('text-[10px]', categoryColors[promptObj.category])}>
                            {promptObj.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono truncate">{promptObj.prompt}</p>
                        {res && res.status !== 'running' && (
                          <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {(res.time / 1000).toFixed(1)}s
                            </span>
                            <span>Score: {res.score}%</span>
                            <span>LLM Calls: {res.llmCalls}</span>
                            <span>Retries: {res.retries}</span>
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => runSingle(promptObj)}
                        disabled={isRunningThis || batchRunning}
                      >
                        {isRunningThis ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
