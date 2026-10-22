/** Agent 4 — Action: assign tasks to roles from gaps */
import type { AgentResult, AuditEntry, Gap } from './types';

export interface Task {
  id: string;
  role: Gap['role'];
  code: string;
  msg: string;
  status: 'open' | 'done';
}

export async function runAction(
  gaps: Gap[],
  audit: AuditEntry[]
): Promise<{ result: AgentResult; tasks: Task[] }> {
  const t0 = Date.now();
  const tasks: Task[] = gaps.map((g, i) => ({
    id: `T-${i + 1}-${g.code}`,
    role: g.role,
    code: g.code,
    msg: g.msg,
    status: 'open',
  }));
  audit.push({
    at: new Date().toISOString(),
    agent: 'action',
    event: 'tasks_assigned',
    data: { count: tasks.length, roles: [...new Set(tasks.map((t) => t.role))] },
  });
  return {
    result: {
      agent: 'action',
      ok: true,
      durationMs: Date.now() - t0,
      output: { tasks },
    },
    tasks,
  };
}
