// Pipeline stage definitions and schemas for the App Compiler

export const PIPELINE_STAGES = [
  {
    id: 'intent',
    name: 'Intent Extraction',
    description: 'Parse user intent into structured intermediate form',
    icon: 'Brain',
  },
  {
    id: 'design',
    name: 'System Design',
    description: 'Convert intent → app architecture with entities, flows, roles',
    icon: 'Network',
  },
  {
    id: 'schema',
    name: 'Schema Generation',
    description: 'Generate UI, API, DB, Auth, and Business Logic configs',
    icon: 'FileJson',
  },
  {
    id: 'validation',
    name: 'Validation & Repair',
    description: 'Detect inconsistencies, repair, and ensure cross-layer consistency',
    icon: 'ShieldCheck',
  },
  {
    id: 'execution',
    name: 'Execution Simulation',
    description: 'Verify output is directly usable to generate a working app',
    icon: 'Play',
  },
];

export const STAGE_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REPAIRED: 'repaired',
};

// JSON Schema contracts for each output layer
export const OUTPUT_SCHEMAS = {
  intent: {
    required: ['app_name', 'app_type', 'core_features', 'user_roles', 'entities', 'key_flows'],
    types: {
      app_name: 'string',
      app_type: 'string',
      core_features: 'array',
      user_roles: 'array',
      entities: 'array',
      key_flows: 'array',
      assumptions: 'array',
      clarifications_needed: 'array',
    },
  },
  design: {
    required: ['architecture', 'entities', 'relationships', 'user_flows', 'role_permissions'],
    types: {
      architecture: 'object',
      entities: 'array',
      relationships: 'array',
      user_flows: 'array',
      role_permissions: 'object',
    },
  },
  ui_schema: {
    required: ['pages', 'components', 'layouts', 'navigation'],
    types: {
      pages: 'array',
      components: 'array',
      layouts: 'object',
      navigation: 'object',
    },
  },
  api_schema: {
    required: ['endpoints', 'middleware', 'error_handling'],
    types: {
      endpoints: 'array',
      middleware: 'array',
      error_handling: 'object',
    },
  },
  db_schema: {
    required: ['tables', 'relationships', 'indexes'],
    types: {
      tables: 'array',
      relationships: 'array',
      indexes: 'array',
    },
  },
  auth_schema: {
    required: ['roles', 'permissions', 'auth_flows'],
    types: {
      roles: 'array',
      permissions: 'object',
      auth_flows: 'object',
    },
  },
  business_logic: {
    required: ['rules', 'workflows', 'gates'],
    types: {
      rules: 'array',
      workflows: 'array',
      gates: 'array',
    },
  },
};

// Validation rules for cross-layer consistency
export const CROSS_LAYER_RULES = [
  {
    id: 'api_db_field_match',
    name: 'API-DB Field Matching',
    description: 'All API endpoint fields must correspond to DB schema columns',
  },
  {
    id: 'ui_api_mapping',
    name: 'UI-API Mapping',
    description: 'All UI form fields must map to valid API endpoints',
  },
  {
    id: 'auth_role_consistency',
    name: 'Auth-Role Consistency',
    description: 'All roles referenced in permissions must be defined in auth schema',
  },
  {
    id: 'entity_relationship_integrity',
    name: 'Entity Relationship Integrity',
    description: 'All foreign keys must reference existing tables',
  },
  {
    id: 'business_logic_entity_match',
    name: 'Business Logic Entity Match',
    description: 'Business rules must reference existing entities and fields',
  },
];
