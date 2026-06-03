// Main compiler orchestrator — runs the multi-stage pipeline

import { base44 } from '@/api/base44Client';
import { STAGE_STATUS } from './pipelineStages';
import {
  INTENT_EXTRACTION_PROMPT,
  SYSTEM_DESIGN_PROMPT,
  SCHEMA_GENERATION_PROMPT,
  VALIDATION_PROMPT,
} from './promptTemplates';
import { safeParseJSON, runFullValidation, simulateExecution } from './validator';

const MAX_RETRIES = 2;

/**
 * Call InvokeLLM with retry logic for JSON parsing
 */
async function callLLM(prompt, retryCount = 0) {
  const response = await base44.integrations.Core.InvokeLLM({
    prompt: prompt + '\n\nRespond with ONLY a valid JSON object. No markdown, no code blocks, no explanation.',
  });

  // If response is already an object (SDK parsed it), return directly
  if (typeof response === 'object' && response !== null) {
    return { success: true, data: response };
  }

  // Try to parse string response
  const parsed = safeParseJSON(response);
  if (parsed.success) return parsed;

  // Retry on parse failure
  if (retryCount < MAX_RETRIES) {
    return callLLM(prompt + '\n\nIMPORTANT: Your previous response was not valid JSON. Output ONLY a valid JSON object. No markdown, no text, no code blocks.', retryCount + 1);
  }

  return parsed;
}

/**
 * Run the full compilation pipeline
 * @param {string} userPrompt - Natural language input
 * @param {function} onStageUpdate - Callback for stage progress updates
 * @returns {object} Complete compilation result
 */
export async function runPipeline(userPrompt, onStageUpdate) {
  const startTime = Date.now();
  const result = {
    input: userPrompt,
    stages: {},
    output: null,
    metrics: { total_time_ms: 0, stage_times: {}, retries: 0, llm_calls: 0 },
  };

  const updateStage = (stageId, status, data = null, error = null) => {
    result.stages[stageId] = { status, data, error, timestamp: Date.now() };
    onStageUpdate?.(stageId, status, data, error);
  };

  // ═══════════════════════════════════════
  // STAGE 1: Intent Extraction
  // ═══════════════════════════════════════
  updateStage('intent', STAGE_STATUS.RUNNING);
  const s1Start = Date.now();

  const intentResult = await callLLM(INTENT_EXTRACTION_PROMPT(userPrompt));
  result.metrics.llm_calls++;

  if (!intentResult.success) {
    updateStage('intent', STAGE_STATUS.FAILED, null, intentResult.error);
    result.metrics.total_time_ms = Date.now() - startTime;
    return result;
  }

  result.metrics.stage_times.intent = Date.now() - s1Start;
  updateStage('intent', STAGE_STATUS.COMPLETED, intentResult.data);

  // ═══════════════════════════════════════
  // STAGE 2: System Design
  // ═══════════════════════════════════════
  updateStage('design', STAGE_STATUS.RUNNING);
  const s2Start = Date.now();

  const designResult = await callLLM(SYSTEM_DESIGN_PROMPT(intentResult.data));
  result.metrics.llm_calls++;

  if (!designResult.success) {
    updateStage('design', STAGE_STATUS.FAILED, null, designResult.error);
    result.metrics.total_time_ms = Date.now() - startTime;
    return result;
  }

  result.metrics.stage_times.design = Date.now() - s2Start;
  updateStage('design', STAGE_STATUS.COMPLETED, designResult.data);

  // ═══════════════════════════════════════
  // STAGE 3: Schema Generation
  // ═══════════════════════════════════════
  updateStage('schema', STAGE_STATUS.RUNNING);
  const s3Start = Date.now();

  const schemaResult = await callLLM(SCHEMA_GENERATION_PROMPT(designResult.data));
  result.metrics.llm_calls++;

  if (!schemaResult.success) {
    updateStage('schema', STAGE_STATUS.FAILED, null, schemaResult.error);
    result.metrics.total_time_ms = Date.now() - startTime;
    return result;
  }

  result.metrics.stage_times.schema = Date.now() - s3Start;
  updateStage('schema', STAGE_STATUS.COMPLETED, schemaResult.data);

  // ═══════════════════════════════════════
  // STAGE 4: Validation & Repair
  // ═══════════════════════════════════════
  updateStage('validation', STAGE_STATUS.RUNNING);
  const s4Start = Date.now();

  // Combine all outputs
  const fullConfig = {
    intent: intentResult.data,
    design: designResult.data,
    ...schemaResult.data,
  };

  // Run validation engine
  const validationResult = runFullValidation(fullConfig);

  // If there are errors, try LLM-based repair
  if (!validationResult.valid && validationResult.issues.length > 0) {
    const repairResult = await callLLM(VALIDATION_PROMPT(fullConfig, validationResult.issues));
    result.metrics.llm_calls++;
    result.metrics.retries++;

    if (repairResult.success && repairResult.data.repairs) {
      // Apply LLM repairs on top of auto-repairs
      validationResult.llm_repairs = repairResult.data.repairs;
      validationResult.cross_layer_fixes = repairResult.data.cross_layer_fixes || [];
    }
  }

  result.metrics.stage_times.validation = Date.now() - s4Start;
  updateStage('validation', validationResult.valid ? STAGE_STATUS.COMPLETED : STAGE_STATUS.REPAIRED, validationResult);

  // ═══════════════════════════════════════
  // STAGE 5: Execution Simulation
  // ═══════════════════════════════════════
  updateStage('execution', STAGE_STATUS.RUNNING);
  const s5Start = Date.now();

  const finalConfig = validationResult.repairedConfig || fullConfig;
  const executionResult = simulateExecution(finalConfig);

  result.metrics.stage_times.execution = Date.now() - s5Start;
  updateStage('execution', executionResult.executable ? STAGE_STATUS.COMPLETED : STAGE_STATUS.FAILED, executionResult);

  // ═══════════════════════════════════════
  // Final Output
  // ═══════════════════════════════════════
  result.output = finalConfig;
  result.validation = validationResult;
  result.execution = executionResult;
  result.metrics.total_time_ms = Date.now() - startTime;

  return result;
}
