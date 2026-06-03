// Structured prompts for each pipeline stage — this is the "compiler specification"

export const INTENT_EXTRACTION_PROMPT = (userInput) => `You are Stage 1 of an App Compiler pipeline. Your job is to extract structured intent from a natural language app description.

INPUT: "${userInput}"

You must output a STRICT JSON object with these exact fields:
{
  "app_name": "string - derived name for the application",
  "app_type": "string - one of: CRM, E-commerce, SaaS, Social, Marketplace, Dashboard, Internal Tool, Content Platform, Other",
  "core_features": ["array of specific feature strings"],
  "user_roles": [{"role": "string", "description": "string", "is_default": boolean}],
  "entities": [{"name": "string", "description": "string", "is_core": boolean}],
  "key_flows": [{"name": "string", "steps": ["string"], "actors": ["string"]}],
  "assumptions": ["array of assumptions you made about underspecified parts"],
  "clarifications_needed": ["array of things that were ambiguous - but make reasonable defaults"]
}

RULES:
- Extract EVERY entity mentioned or implied
- Identify ALL user roles, including implicit ones (e.g., "admin" is always implied)
- Map features to specific flows with concrete steps
- If something is vague, make a REASONABLE assumption and document it in "assumptions"
- Always include authentication-related flows
- Output ONLY valid JSON. No markdown, no explanations, no code blocks.`;

export const SYSTEM_DESIGN_PROMPT = (intentJson) => `You are Stage 2 of an App Compiler pipeline. Convert the extracted intent into a system architecture.

INPUT INTENT:
${JSON.stringify(intentJson, null, 2)}

Output a STRICT JSON object:
{
  "architecture": {
    "pattern": "string - e.g., MVC, microservices, serverless",
    "frontend_framework": "React",
    "state_management": "string",
    "api_style": "REST"
  },
  "entities": [
    {
      "name": "string",
      "fields": [
        {"name": "string", "type": "string|number|boolean|date|enum|relation|array|object", "required": boolean, "unique": boolean, "default": null, "constraints": {}}
      ],
      "timestamps": true
    }
  ],
  "relationships": [
    {"from": "string", "to": "string", "type": "one-to-one|one-to-many|many-to-many", "foreign_key": "string"}
  ],
  "user_flows": [
    {"name": "string", "trigger": "string", "steps": [{"action": "string", "component": "string", "api_call": "string"}]}
  ],
  "role_permissions": {
    "role_name": {
      "entity_name": ["create", "read", "update", "delete"]
    }
  }
}

RULES:
- Every entity from intent MUST appear with full field definitions
- Include id, created_at, updated_at for every entity
- Define ALL relationships explicitly
- Permissions must cover every entity × role combination
- Use concrete types, not vague descriptions
- Output ONLY valid JSON.`;

export const SCHEMA_GENERATION_PROMPT = (designJson) => `You are Stage 3 of an App Compiler pipeline. Generate complete schemas for all layers.

INPUT DESIGN:
${JSON.stringify(designJson, null, 2)}

Output a STRICT JSON with 5 sub-schemas:

{
  "ui_schema": {
    "pages": [
      {"path": "string", "name": "string", "layout": "string", "components": ["string"], "auth_required": boolean, "allowed_roles": ["string"]}
    ],
    "components": [
      {"name": "string", "type": "form|table|chart|card|modal|list|nav|layout", "props": {}, "data_source": "string", "actions": [{"label": "string", "api_endpoint": "string", "method": "string"}]}
    ],
    "layouts": {
      "default": {"sidebar": boolean, "header": boolean, "footer": boolean},
      "auth": {"sidebar": false, "header": false, "footer": false}
    },
    "navigation": {
      "main_menu": [{"label": "string", "path": "string", "icon": "string", "roles": ["string"]}]
    }
  },
  "api_schema": {
    "endpoints": [
      {"path": "string", "method": "GET|POST|PUT|DELETE", "auth_required": boolean, "allowed_roles": ["string"], "request_body": {}, "response": {}, "validation_rules": {}}
    ],
    "middleware": [
      {"name": "string", "type": "auth|validation|rate_limit|logging", "config": {}}
    ],
    "error_handling": {
      "codes": {"400": "Bad Request", "401": "Unauthorized", "403": "Forbidden", "404": "Not Found", "500": "Internal Server Error"}
    }
  },
  "db_schema": {
    "tables": [
      {"name": "string", "columns": [{"name": "string", "type": "string", "primary_key": boolean, "nullable": boolean, "unique": boolean, "default": null, "foreign_key": null}]}
    ],
    "relationships": [
      {"from_table": "string", "from_column": "string", "to_table": "string", "to_column": "string", "type": "string"}
    ],
    "indexes": [
      {"table": "string", "columns": ["string"], "unique": boolean}
    ]
  },
  "auth_schema": {
    "roles": [{"name": "string", "level": number, "is_default": boolean}],
    "permissions": {
      "role_name": {"resource": ["action"]}
    },
    "auth_flows": {
      "login": {"method": "email_password", "mfa": boolean},
      "registration": {"fields": ["string"], "verification": "string"},
      "password_reset": {"method": "email_link"}
    }
  },
  "business_logic": {
    "rules": [
      {"name": "string", "entity": "string", "condition": "string", "action": "string", "priority": number}
    ],
    "workflows": [
      {"name": "string", "trigger": "string", "steps": [{"type": "string", "config": {}}]}
    ],
    "gates": [
      {"name": "string", "type": "role|plan|feature_flag|condition", "config": {}}
    ]
  }
}

RULES:
- Every entity field MUST appear as a DB column AND have corresponding API endpoints
- Every UI form field MUST map to an API endpoint field
- Every role in auth MUST have permissions defined
- Navigation items MUST match page paths
- All foreign keys in DB MUST reference existing tables
- Output ONLY valid JSON.`;

export const VALIDATION_PROMPT = (fullConfig, issues) => `You are Stage 4 of an App Compiler pipeline - the Validation & Repair engine.

CURRENT CONFIG:
${JSON.stringify(fullConfig, null, 2)}

DETECTED ISSUES:
${JSON.stringify(issues, null, 2)}

For each issue, provide a targeted repair. Output:
{
  "repairs": [
    {
      "issue_id": "string - matches the issue",
      "layer": "string - which schema layer",
      "path": "string - JSON path to fix",
      "action": "add|modify|remove",
      "value": "the corrected value",
      "explanation": "string"
    }
  ],
  "cross_layer_fixes": [
    {
      "description": "string",
      "affected_layers": ["string"],
      "fix_applied": "string"
    }
  ],
  "validation_passed": boolean,
  "remaining_issues": []
}

RULES:
- Fix ONLY the identified issues - do not restructure the entire config
- Preserve all existing valid data
- Ensure fixes maintain cross-layer consistency
- Output ONLY valid JSON.`;
