#!/usr/bin/env node
// Orchestrator SubagentStop hook (agent-scoped, Local harness). Appends an audit line per
// finished specialist to sessions/.hook-log.jsonl. The real state merge is done by the
// orchestrator via the session-store skill — this log is an audit trail, not the source of truth.
'use strict';
const fs = require('fs');
const path = require('path');

const sessionsDir = path.join(process.cwd(), 'sessions');
const logPath = path.join(sessionsDir, '.hook-log.jsonl');

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => (raw += chunk));
process.stdin.on('end', () => {
  let event = {};
  try {
    event = raw ? JSON.parse(raw) : {};
  } catch {
    event = {};
  }
  if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir, { recursive: true });
  const entry = {
    timestamp: event.timestamp || new Date().toISOString(),
    event: event.hook_event_name || 'SubagentStop',
    agent: typeof event.agent_type === 'string' ? event.agent_type : null,
    sessionId: typeof event.session_id === 'string' ? event.session_id : null
  };
  fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
});
