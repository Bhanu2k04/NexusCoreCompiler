import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function JsonNode({ data, depth = 0, defaultExpanded = true }) {
  const [expanded, setExpanded] = useState(defaultExpanded && depth < 2);

  if (data === null) return <span className="json-null">null</span>;
  if (data === undefined) return <span className="json-null">undefined</span>;
  if (typeof data === 'boolean') return <span className="json-boolean">{data.toString()}</span>;
  if (typeof data === 'number') return <span className="json-number">{data}</span>;
  if (typeof data === 'string') return <span className="json-string">"{data.length > 100 ? data.slice(0, 100) + '...' : data}"</span>;

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="json-bracket">[]</span>;
    return (
      <span>
        <button onClick={() => setExpanded(!expanded)} className="inline-flex items-center hover:opacity-70">
          {expanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
          <span className="json-bracket">[</span>
          {!expanded && <span className="text-muted-foreground text-xs ml-1">{data.length} items</span>}
        </button>
        {expanded && (
          <div className="ml-4 border-l border-border/50 pl-2">
            {data.map((item, i) => (
              <div key={i} className="py-0.5">
                <JsonNode data={item} depth={depth + 1} />
                {i < data.length - 1 && <span className="text-muted-foreground">,</span>}
              </div>
            ))}
          </div>
        )}
        {expanded && <span className="json-bracket">]</span>}
      </span>
    );
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data);
    if (entries.length === 0) return <span className="json-bracket">{'{}'}</span>;
    return (
      <span>
        <button onClick={() => setExpanded(!expanded)} className="inline-flex items-center hover:opacity-70">
          {expanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
          <span className="json-bracket">{'{'}</span>
          {!expanded && <span className="text-muted-foreground text-xs ml-1">{entries.length} keys</span>}
        </button>
        {expanded && (
          <div className="ml-4 border-l border-border/50 pl-2">
            {entries.map(([key, value], i) => (
              <div key={key} className="py-0.5">
                <span className="json-key">"{key}"</span>
                <span className="text-muted-foreground">: </span>
                <JsonNode data={value} depth={depth + 1} />
                {i < entries.length - 1 && <span className="text-muted-foreground">,</span>}
              </div>
            ))}
          </div>
        )}
        {expanded && <span className="json-bracket">{'}'}</span>}
      </span>
    );
  }

  return <span>{String(data)}</span>;
}

export default function JsonViewer({ data, title, maxHeight = '400px' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
          <span className="text-xs font-mono font-medium text-muted-foreground">{title}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
            {copied ? <Check className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      )}
      <div className="p-3 overflow-auto font-mono text-xs leading-relaxed" style={{ maxHeight }}>
        <JsonNode data={data} />
      </div>
    </div>
  );
}
