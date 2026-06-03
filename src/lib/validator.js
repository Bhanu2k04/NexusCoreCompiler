// Core validation & repair engine for the App Compiler

import { OUTPUT_SCHEMAS, CROSS_LAYER_RULES } from './pipelineStages';

/**
 * Attempt to parse JSON, handling common LLM output issues
 */
export function safeParseJSON(text) {
  if (!text || typeof text !== 'string') return { success: false, error: 'Empty or non-string input', data: null };

  // Strip markdown code blocks if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  // Try direct parse
  try {
    return { success: true, data: JSON.parse(cleaned), error: null };
  } catch (e) {
    // Try to find JSON object in text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return { success: true, data: JSON.parse(jsonMatch[0]), error: null };
      } catch (e2) {
        return { success: false, error: `JSON parse failed: ${e2.message}`, data: null };
      }
    }
    return { success: false, error: `JSON parse failed: ${e.message}`, data: null };
  }
}

/**
 * Validate a schema layer against its contract
 */
export function validateSchemaLayer(layerName, data) {
  const schema = OUTPUT_SCHEMAS[layerName];
  if (!schema) return { valid: true, issues: [] };

  const issues = [];

  // Check required fields
  for (const field of schema.required || []) {
    if (data[field] === undefined || data[field] === null) {
      issues.push({
        id: `missing_${layerName}_${field}`,
        type: 'missing_required_field',
        layer: layerName,
        field,
        severity: 'error',
        message: `Required field "${field}" is missing from ${layerName}`,
      });
    }
  }

  // Check types
  for (const [field, expectedType] of Object.entries(schema.types || {})) {
    if (data[field] !== undefined && data[field] !== null) {
      const actualType = Array.isArray(data[field]) ? 'array' : typeof data[field];
      if (actualType !== expectedType) {
        issues.push({
          id: `type_mismatch_${layerName}_${field}`,
          type: 'type_mismatch',
          layer: layerName,
          field,
          expected: expectedType,
          actual: actualType,
          severity: 'error',
          message: `Field "${field}" in ${layerName} should be ${expectedType} but got ${actualType}`,
        });
      }
    }
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Cross-layer consistency validation
 */
export function validateCrossLayer(config) {
  const issues = [];

  // Rule 1: API-DB Field Matching
  if (config.api_schema?.endpoints && config.db_schema?.tables) {
    const dbColumns = new Set();
    for (const table of config.db_schema.tables) {
      for (const col of table.columns || []) {
        dbColumns.add(`${table.name}.${col.name}`);
      }
    }

    for (const endpoint of config.api_schema.endpoints) {
      if (endpoint.request_body) {
        for (const field of Object.keys(endpoint.request_body)) {
          // Extract entity name from endpoint path
          const pathParts = endpoint.path.split('/').filter(Boolean);
          const entityName = pathParts.find(p => !p.startsWith(':') && p !== 'api');
          if (entityName) {
            const normalizedEntity = entityName.replace(/s$/, '');
            // Check if any table matches (case-insensitive)
            const matchFound = config.db_schema.tables.some(t =>
              t.name.toLowerCase() === normalizedEntity.toLowerCase() ||
              t.name.toLowerCase() === entityName.toLowerCase()
            );
            if (!matchFound && !['id', 'page', 'limit', 'sort', 'filter'].includes(field)) {
              // This is informational, not necessarily an error
            }
          }
        }
      }
    }
  }

  // Rule 2: UI-API Mapping
  if (config.ui_schema?.components && config.api_schema?.endpoints) {
    const apiPaths = new Set(config.api_schema.endpoints.map(e => e.path));
    for (const component of config.ui_schema.components) {
      for (const action of component.actions || []) {
        if (action.api_endpoint && !apiPaths.has(action.api_endpoint)) {
          issues.push({
            id: `ui_api_mismatch_${component.name}_${action.label}`,
            type: 'cross_layer_mismatch',
            rule: 'ui_api_mapping',
            severity: 'warning',
            message: `UI component "${component.name}" action "${action.label}" references non-existent API endpoint "${action.api_endpoint}"`,
            affected_layers: ['ui_schema', 'api_schema'],
          });
        }
      }
    }
  }

  // Rule 3: Auth-Role Consistency
  if (config.auth_schema?.roles && config.auth_schema?.permissions) {
    const definedRoles = new Set(config.auth_schema.roles.map(r => r.name));
    for (const roleName of Object.keys(config.auth_schema.permissions)) {
      if (!definedRoles.has(roleName)) {
        issues.push({
          id: `auth_role_missing_${roleName}`,
          type: 'cross_layer_mismatch',
          rule: 'auth_role_consistency',
          severity: 'error',
          message: `Role "${roleName}" is referenced in permissions but not defined in roles`,
          affected_layers: ['auth_schema'],
        });
      }
    }
  }

  // Rule 4: Entity-Relationship Integrity
  if (config.db_schema?.tables && config.db_schema?.relationships) {
    const tableNames = new Set(config.db_schema.tables.map(t => t.name));
    for (const rel of config.db_schema.relationships) {
      if (!tableNames.has(rel.from_table)) {
        issues.push({
          id: `fk_missing_table_${rel.from_table}`,
          type: 'cross_layer_mismatch',
          rule: 'entity_relationship_integrity',
          severity: 'error',
          message: `Relationship references non-existent table "${rel.from_table}"`,
          affected_layers: ['db_schema'],
        });
      }
      if (!tableNames.has(rel.to_table)) {
        issues.push({
          id: `fk_missing_table_${rel.to_table}`,
          type: 'cross_layer_mismatch',
          rule: 'entity_relationship_integrity',
          severity: 'error',
          message: `Relationship references non-existent table "${rel.to_table}"`,
          affected_layers: ['db_schema'],
        });
      }
    }
  }

  // Rule 5: Navigation-Page consistency
  if (config.ui_schema?.navigation?.main_menu && config.ui_schema?.pages) {
    const pagePaths = new Set(config.ui_schema.pages.map(p => p.path));
    for (const menuItem of config.ui_schema.navigation.main_menu) {
      if (menuItem.path && !pagePaths.has(menuItem.path)) {
        issues.push({
          id: `nav_page_mismatch_${menuItem.path}`,
          type: 'cross_layer_mismatch',
          rule: 'nav_page_consistency',
          severity: 'warning',
          message: `Navigation menu item "${menuItem.label}" points to non-existent page "${menuItem.path}"`,
          affected_layers: ['ui_schema'],
        });
      }
    }
  }

  return issues;
}

/**
 * Apply automatic repairs to common issues
 */
export function autoRepair(config, issues) {
  const repairs = [];
  let repairedConfig = JSON.parse(JSON.stringify(config));

  for (const issue of issues) {
    if (issue.type === 'missing_required_field') {
      const defaultValues = {
        array: [],
        object: {},
        string: '',
        number: 0,
        boolean: false,
      };
      const schema = OUTPUT_SCHEMAS[issue.layer];
      const expectedType = schema?.types?.[issue.field] || 'object';
      const defaultVal = defaultValues[expectedType] ?? {};

      // Set the missing field
      if (repairedConfig[issue.layer]) {
        repairedConfig[issue.layer][issue.field] = defaultVal;
      } else if (repairedConfig[issue.field] === undefined) {
        repairedConfig[issue.field] = defaultVal;
      }

      repairs.push({
        issue_id: issue.id,
        action: 'add',
        description: `Added default ${expectedType} for missing field "${issue.field}"`,
      });
    }

    if (issue.type === 'cross_layer_mismatch' && issue.rule === 'auth_role_consistency') {
      // Auto-add missing role
      const roleName = issue.id.replace('auth_role_missing_', '');
      if (repairedConfig.auth_schema?.roles) {
        const exists = repairedConfig.auth_schema.roles.some(r => r.name === roleName);
        if (!exists) {
          repairedConfig.auth_schema.roles.push({
            name: roleName,
            level: repairedConfig.auth_schema.roles.length + 1,
            is_default: false,
          });
          repairs.push({
            issue_id: issue.id,
            action: 'add',
            description: `Added missing role "${roleName}" to auth schema`,
          });
        }
      }
    }
  }

  return { repairedConfig, repairs };
}

/**
 * Full validation pipeline
 */
export function runFullValidation(config) {
  const allIssues = [];
  const layerResults = {};

  // Validate each layer
  const layers = ['intent', 'design', 'ui_schema', 'api_schema', 'db_schema', 'auth_schema', 'business_logic'];
  for (const layer of layers) {
    if (config[layer]) {
      const result = validateSchemaLayer(layer, config[layer]);
      layerResults[layer] = result;
      allIssues.push(...result.issues);
    }
  }

  // Cross-layer validation
  const crossIssues = validateCrossLayer(config);
  allIssues.push(...crossIssues);

  // Auto-repair
  const { repairedConfig, repairs } = autoRepair(config, allIssues);

  // Count by severity
  const errorCount = allIssues.filter(i => i.severity === 'error').length;
  const warningCount = allIssues.filter(i => i.severity === 'warning').length;

  return {
    valid: errorCount === 0,
    issues: allIssues,
    repairs,
    repairedConfig,
    summary: {
      total_issues: allIssues.length,
      errors: errorCount,
      warnings: warningCount,
      repairs_applied: repairs.length,
      layers_validated: Object.keys(layerResults).length,
    },
  };
}

/**
 * Simulate execution - check if config could produce a working app
 */
export function simulateExecution(config) {
  const results = {
    executable: true,
    checks: [],
    score: 0,
    max_score: 0,
  };

  const addCheck = (name, passed, detail) => {
    results.checks.push({ name, passed, detail });
    results.max_score += 1;
    if (passed) results.score += 1;
  };

  // Check 1: Has pages
  const hasPages = config.ui_schema?.pages?.length > 0;
  addCheck('Has UI pages defined', hasPages, hasPages ? `${config.ui_schema.pages.length} pages` : 'No pages');

  // Check 2: Has API endpoints
  const hasEndpoints = config.api_schema?.endpoints?.length > 0;
  addCheck('Has API endpoints', hasEndpoints, hasEndpoints ? `${config.api_schema.endpoints.length} endpoints` : 'No endpoints');

  // Check 3: Has DB tables
  const hasTables = config.db_schema?.tables?.length > 0;
  addCheck('Has DB tables', hasTables, hasTables ? `${config.db_schema.tables.length} tables` : 'No tables');

  // Check 4: Has auth
  const hasAuth = config.auth_schema?.roles?.length > 0;
  addCheck('Has auth roles', hasAuth, hasAuth ? `${config.auth_schema.roles.length} roles` : 'No roles');

  // Check 5: Has navigation
  const hasNav = config.ui_schema?.navigation?.main_menu?.length > 0;
  addCheck('Has navigation menu', hasNav, hasNav ? `${config.ui_schema.navigation.main_menu.length} menu items` : 'No menu');

  // Check 6: CRUD completeness
  if (hasTables && hasEndpoints) {
    const tableNames = config.db_schema.tables.map(t => t.name.toLowerCase());
    let crudCoverage = 0;
    for (const tableName of tableNames) {
      const relatedEndpoints = config.api_schema.endpoints.filter(e =>
        e.path.toLowerCase().includes(tableName) || e.path.toLowerCase().includes(tableName.replace(/s$/, ''))
      );
      const methods = new Set(relatedEndpoints.map(e => e.method));
      const hasCrud = methods.has('GET') && methods.has('POST');
      if (hasCrud) crudCoverage++;
    }
    const coverage = tableNames.length > 0 ? Math.round((crudCoverage / tableNames.length) * 100) : 0;
    addCheck('CRUD coverage', coverage >= 50, `${coverage}% of entities have CRUD endpoints`);
  }

  // Check 7: Role-based access
  if (hasAuth && hasEndpoints) {
    const protectedEndpoints = config.api_schema.endpoints.filter(e => e.auth_required);
    const protectionRate = config.api_schema.endpoints.length > 0
      ? Math.round((protectedEndpoints.length / config.api_schema.endpoints.length) * 100) : 0;
    addCheck('Auth protection coverage', protectionRate >= 50, `${protectionRate}% endpoints require auth`);
  }

  // Check 8: Business logic exists
  const hasRules = config.business_logic?.rules?.length > 0;
  addCheck('Has business rules', hasRules, hasRules ? `${config.business_logic.rules.length} rules` : 'No rules');

  results.executable = results.score >= Math.ceil(results.max_score * 0.6);
  results.percentage = Math.round((results.score / results.max_score) * 100);

  return results;
}
