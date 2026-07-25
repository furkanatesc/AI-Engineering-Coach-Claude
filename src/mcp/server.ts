/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/* Standalone MCP server: exposes the same coach tools as the VS Code chat participant to any
 * MCP client (Claude Code, Copilot CLI, …) over stdio. Runs in a plain Node process — parses
 * sessions in-process via the same core pipeline the extension uses, with no `vscode` module. */

import { format } from 'node:util';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { Analyzer } from '../core/analyzer';
import { findLogsDirs, parseAllLogsAsyncDetailed } from '../core/parser';
import { redactSecrets } from '../core/redact-secrets';
import { COACH_TOOLS } from './tool-registry';

const RELOAD_TOOL = 'aiEngineerCoach_reload';

// stdout carries the JSON-RPC stream; anything human-readable must go to stderr.
function log(message: string): void {
  process.stderr.write(`[ai-coach-mcp] ${message}\n`);
}

/* Core logging routes info/debug through console.info/console.debug, which Node writes to
 * stdout — the channel the JSON-RPC framing owns. Divert every console channel to stderr
 * before any core module gets a chance to log, or the transport sees corrupt frames. */
for (const level of ['log', 'info', 'debug', 'warn', 'trace'] as const) {
  console[level] = (...args: unknown[]) => {
    process.stderr.write(`${format(...args)}\n`);
  };
}

let analyzerPromise: Promise<Analyzer> | undefined;
let lastParseSummary = 'no data parsed yet';

async function buildAnalyzer(): Promise<Analyzer> {
  const dirs = findLogsDirs();
  if (dirs.length === 0) {
    throw new Error('No AI assistant log directories were found for this user. Use VS Code, Claude, Codex, or OpenCode at least once, then reload.');
  }
  log(`parsing logs from ${dirs.length} director${dirs.length === 1 ? 'y' : 'ies'}…`);
  const { result } = await parseAllLogsAsyncDetailed(dirs);
  const analyzer = new Analyzer(result.sessions, result.editLocIndex, result.workspaces);
  lastParseSummary = `${result.sessions.length} sessions across ${result.workspaces.size} workspaces`;
  log(`ready — ${lastParseSummary}`);
  try {
    await analyzer.warmUp();
  } catch { /* warm-up is best effort */ }
  return analyzer;
}

/** Parses on first use and caches. A failed parse clears the cache so a later call retries. */
function loadAnalyzer(): Promise<Analyzer> {
  analyzerPromise ??= buildAnalyzer().catch((error: unknown) => {
    analyzerPromise = undefined;
    throw error;
  });
  return analyzerPromise;
}

const server = new Server(
  { name: 'ai-engineer-coach', version: '0.1.0' },
  {
    capabilities: { tools: {} },
    instructions:
      'Analyzes the local developer\'s own AI coding assistant usage across VS Code, Xcode, Claude, Codex, and ' +
      'OpenCode. Read-only and fully local. Start with aiEngineerCoach_summary for an overview, then drill into ' +
      `patterns, flow, or insights. Call ${RELOAD_TOOL} to re-parse after new coding sessions.`,
  },
);

server.setRequestHandler(ListToolsRequestSchema, () => ({
  tools: [
    ...COACH_TOOLS.map(def => ({
      name: def.name,
      description: def.description,
      inputSchema: def.inputSchema,
    })),
    {
      name: RELOAD_TOOL,
      description: 'Re-parse local session logs. Use when coding has happened since this server started and the data looks stale.',
      inputSchema: { type: 'object', properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === RELOAD_TOOL) {
    analyzerPromise = undefined;
    await loadAnalyzer();
    return { content: [{ type: 'text', text: `Reloaded — ${lastParseSummary}.` }] };
  }

  const def = COACH_TOOLS.find(t => t.name === name);
  if (!def) {
    return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
  }

  try {
    const analyzer = await loadAnalyzer();
    const output = def.run(analyzer, args ?? {});
    // Redact at this single egress so every formatter result is scrubbed before it
    // reaches the model — individual formatters don't need to remember to do it.
    const text = output.kind === 'json'
      ? redactSecrets(JSON.stringify(output.data, null, 2))
      : output.text;
    return { content: [{ type: 'text', text }] };
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error);
    log(`${name} failed: ${detail}`);
    return { content: [{ type: 'text', text: `Coach tool "${name}" failed: ${detail}` }], isError: true };
  }
});

async function main(): Promise<void> {
  await server.connect(new StdioServerTransport());
  log('listening on stdio');
}

main().catch((error: unknown) => {
  log(`fatal: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
