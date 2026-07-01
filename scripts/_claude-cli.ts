import { spawn } from 'node:child_process';
import fs from 'node:fs';

type ClaudeOptions = {
  jsonSchema?: object;
  model?: string;
};

type ClaudeEnvelope = {
  type: string;
  subtype: string;
  is_error: boolean;
  result: string;
  total_cost_usd?: number;
  duration_ms?: number;
};

export const runClaude = (
  prompt: string,
  options: ClaudeOptions = {}
): Promise<{ result: unknown; costUsd?: number; durationMs?: number }> => {
  return new Promise((resolve, reject) => {
    const args = [
      '-p',
      '--output-format',
      'json',
      '--no-session-persistence',
      // Override Claude Code's agent system prompt with a minimal JSON-only one.
      // Without this, the agent emits prose explaining its work instead of the JSON.
      '--system-prompt',
      'You are a JSON generator. Respond with the JSON object only — no prose, no commentary, no markdown fencing. Match the provided schema exactly.',
      // Disable every tool so the model stays focused on the structured output.
      '--disallowedTools',
      'Bash,Edit,Write,Read,Glob,Grep,WebFetch,WebSearch,Task,TodoWrite,NotebookEdit,SlashCommand',
    ];
    if (options.model) {
      args.push('--model', options.model);
    }
    if (options.jsonSchema) {
      args.push('--json-schema', JSON.stringify(options.jsonSchema));
    }

    const proc = spawn('claude', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false,
    });

    // setEncoding makes the stream emit strings with UTF-8 boundaries handled
    // correctly (uses StringDecoder internally). Without this, multi-byte
    // characters split across chunks corrupt the output (e.g. Hebrew).
    proc.stdout.setEncoding('utf8');
    proc.stderr.setEncoding('utf8');

    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (chunk: string) => {
      stdout += chunk;
    });
    proc.stderr.on('data', (chunk: string) => {
      stderr += chunk;
    });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`claude exited ${code}: ${stderr || stdout}`));
        return;
      }
      let envelope: ClaudeEnvelope;
      try {
        envelope = JSON.parse(stdout);
      } catch {
        // Dump full stdout for inspection
        fs.writeFileSync('claude-debug-stdout.txt', stdout);
        reject(
          new Error(
            `Failed to parse claude envelope (stdout dumped to claude-debug-stdout.txt, ${stdout.length} chars):\n${stdout.slice(-500)}`
          )
        );
        return;
      }
      if (envelope.is_error) {
        reject(new Error(`claude error: ${envelope.result || stdout}`));
        return;
      }
      // Strip ```json ... ``` fencing if the model wrapped its output
      const stripFencing = (text: string): string => {
        const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        return (fenced?.[1] ?? text).trim();
      };

      let inner: unknown;
      try {
        inner = JSON.parse(stripFencing(envelope.result));
      } catch {
        fs.writeFileSync('claude-debug-result.txt', envelope.result);
        reject(
          new Error(
            `claude result is not valid JSON (dumped to claude-debug-result.txt, ${envelope.result.length} chars):\nfirst 500: ${envelope.result.slice(0, 500)}\nlast 500: ${envelope.result.slice(-500)}`
          )
        );
        return;
      }
      resolve({
        result: inner,
        costUsd: envelope.total_cost_usd,
        durationMs: envelope.duration_ms,
      });
    });

    proc.stdin.write(prompt);
    proc.stdin.end();
  });
};
