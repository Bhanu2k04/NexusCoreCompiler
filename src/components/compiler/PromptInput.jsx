import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Terminal, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const EXAMPLE_PROMPTS = [
  'Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins can see analytics.',
  'Create a project management tool with teams, kanban boards, deadlines, file attachments, and member roles.',
  'Build an e-commerce platform with product catalog, shopping cart, checkout, order tracking, and admin panel.',
  'Create a learning management system with courses, lessons, quizzes, student progress tracking, and instructor dashboard.',
  'Build a restaurant reservation system with table management, booking calendar, menu display, and customer reviews.',
];

export default function PromptInput({ onSubmit, isRunning }) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    if (!prompt.trim() || isRunning) return;
    onSubmit(prompt.trim());
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono text-primary/60">compile</span>
          <span className="text-xs font-mono text-muted-foreground">→</span>
        </div>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the application you want to build..."
          className="min-h-[120px] pt-10 font-mono text-sm bg-card border-border resize-none focus:border-primary/50 transition-colors"
          disabled={isRunning}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium shrink-0">Examples:</span>
          {EXAMPLE_PROMPTS.slice(0, 3).map((ex, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(ex)}
              disabled={isRunning}
              className="text-[11px] px-2 py-1 rounded border border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {ex.slice(0, 40)}...
            </button>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!prompt.trim() || isRunning}
          className="shrink-0 gap-2 bg-primary hover:bg-primary/90"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Compiling...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Compile
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
