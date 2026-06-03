import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Database, Globe, Server, Shield, Cog, Brain, Network } from 'lucide-react';
import JsonViewer from './JsonViewer';
import ValidationReport from './ValidationReport';
import ExecutionReport from './ExecutionReport';
import MetricsPanel from './MetricsPanel';

const SCHEMA_TABS = [
  { id: 'ui_schema', label: 'UI Schema', icon: Globe },
  { id: 'api_schema', label: 'API Schema', icon: Server },
  { id: 'db_schema', label: 'DB Schema', icon: Database },
  { id: 'auth_schema', label: 'Auth', icon: Shield },
  { id: 'business_logic', label: 'Business Logic', icon: Cog },
  { id: 'intent', label: 'Intent', icon: Brain },
  { id: 'design', label: 'Design', icon: Network },
];

export default function OutputTabs({ result }) {
  const [activeTab, setActiveTab] = useState('ui_schema');

  if (!result?.output) return null;

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 border border-border flex-wrap h-auto gap-1 p-1">
          {SCHEMA_TABS.map(tab => {
            const Icon = tab.icon;
            const hasData = result.output[tab.id];
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                disabled={!hasData}
                className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </TabsTrigger>
            );
          })}
          <TabsTrigger
            value="validation"
            className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Shield className="w-3 h-3" />
            Validation
          </TabsTrigger>
          <TabsTrigger
            value="execution"
            className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Cog className="w-3 h-3" />
            Execution
          </TabsTrigger>
          <TabsTrigger
            value="metrics"
            className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Cog className="w-3 h-3" />
            Metrics
          </TabsTrigger>
        </TabsList>

        {SCHEMA_TABS.map(tab => (
          <TabsContent key={tab.id} value={tab.id} className="mt-3">
            {result.output[tab.id] && (
              <JsonViewer data={result.output[tab.id]} title={`${tab.label} — Generated Output`} maxHeight="500px" />
            )}
          </TabsContent>
        ))}

        <TabsContent value="validation" className="mt-3">
          <ValidationReport validation={result.validation} />
        </TabsContent>

        <TabsContent value="execution" className="mt-3">
          <ExecutionReport execution={result.execution} />
        </TabsContent>

        <TabsContent value="metrics" className="mt-3">
          <MetricsPanel metrics={result.metrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
