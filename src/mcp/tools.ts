/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * VS Code Language Model Tools — exposes the shared coach tool table (`tool-registry.ts`)
 * to the @aicoach chat participant.
 */

import * as vscode from 'vscode';
import type { Analyzer } from '../core/analyzer';
import { redactSecrets } from '../core/redact-secrets';
import { COACH_TOOLS, type ToolOutput } from './tool-registry';

function toResult(output: ToolOutput): vscode.LanguageModelToolResult {
  // Redact at this single egress so every formatter result is scrubbed before it
  // reaches the model — individual formatters don't need to remember to do it.
  const text = output.kind === 'json'
    ? redactSecrets(JSON.stringify(output.data, null, 2))
    : output.text;
  return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(text)]);
}

export function registerTools(context: vscode.ExtensionContext, getAnalyzer: () => Analyzer | undefined): void {
  for (const def of COACH_TOOLS) {
    const tool: vscode.LanguageModelTool<Record<string, unknown>> = {
      invoke(options, _token) {
        const analyzer = getAnalyzer();
        if (!analyzer) {
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart('No data loaded yet. Open the AI Engineer Coach sidebar first to load your session data.'),
          ]);
        }
        return toResult(def.run(analyzer, options.input));
      },
      prepareInvocation(_options, _token) {
        return { invocationMessage: def.prepareMessage };
      },
    };
    context.subscriptions.push(vscode.lm.registerTool(def.name, tool));
  }
}

export { COACH_TOOLS as TOOL_DEFS };
