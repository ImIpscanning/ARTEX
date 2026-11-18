// Centralised status → color/label semantics, reused across the whole app.
// Spec §8.3: 意图 / 覆盖 / 任务 / 严重度 each have a consistent color set.

export type Tone = "neutral" | "blue" | "green" | "amber" | "red" | "rose" | "violet" | "slate";

export const toneClasses: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-transparent",
  blue: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  green: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  red: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
  // rose 用作「严重」——实心高强调,视觉上明显高于「高危」的软红描边。
  rose: "bg-rose-600 text-white border-rose-600 dark:bg-rose-600 dark:text-white",
  violet: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20",
  slate: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

export const toneDot: Record<Tone, string> = {
  neutral: "bg-muted-foreground",
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  rose: "bg-white",
  violet: "bg-violet-500",
  slate: "bg-slate-500",
};

interface StatusMeta {
  label: string;
  tone: Tone;
}

const intent: Record<string, StatusMeta> = {
  open: { label: "Pendiente", tone: "slate" },
  running: { label: "En ejecución", tone: "blue" },
  paused: { label: "En pausa", tone: "amber" },
  done: { label: "Completado", tone: "green" },
  // blocked = 模型/API/网络故障重试用尽，这条意图基本没真正探成（非目标拦截）。
  blocked: { label: "Error de ejecución", tone: "red" },
  // exhausted = 达到步数/时间预算被中途掐断、只写回部分结果（非方向已探尽）。
  exhausted: { label: "Límite alcanzado", tone: "violet" },
  // stopped = 历史软删除状态（保留,历史数据）。
  stopped: { label: "Detenido", tone: "slate" },
  // deleted = 用户假删除了该意图（保留节点与血缘，删除原因见 delete_reason 字段）。
  deleted: { label: "Eliminado", tone: "slate" },
};

const task: Record<string, StatusMeta> = {
  created: { label: "Creado", tone: "slate" },
  queued: { label: "En cola", tone: "amber" },
  running: { label: "En curso", tone: "blue" },
  paused: { label: "En pausa", tone: "amber" },
  done: { label: "Completado", tone: "green" },
  failed: { label: "Fallido", tone: "red" },
  timeout: { label: "Tiempo agotado", tone: "amber" },
};

const severity: Record<string, StatusMeta> = {
  critical: { label: "Crítico", tone: "rose" },
  high: { label: "Alto", tone: "red" },
  medium: { label: "Medio", tone: "amber" },
  low: { label: "Bajo", tone: "slate" },
};

const finding: Record<string, StatusMeta> = {
  pending: { label: "Pendiente", tone: "amber" },
  in_progress: { label: "En proceso", tone: "blue" },
  confirmed: { label: "Confirmado", tone: "red" },
  resolved: { label: "Resuelto", tone: "green" },
  fixed: { label: "Corregido", tone: "green" },
  false_positive: { label: "Falso positivo", tone: "slate" },
  ignored: { label: "Ignorado", tone: "neutral" },
  duplicate: { label: "Duplicado", tone: "neutral" },
  risk_accepted: { label: "Riesgo aceptado", tone: "violet" },
};

const engine: Record<string, StatusMeta> = {
  exploring: { label: "En análisis", tone: "blue" },
  paused: { label: "En pausa", tone: "amber" },
  stalled: { label: "Sin avances", tone: "red" },
  idle: { label: "Inactivo", tone: "neutral" },
};

const goal: Record<string, StatusMeta> = {
  open: { label: "En curso", tone: "blue" },
  met: { label: "Alcanzado", tone: "green" },
  abandoned: { label: "Abandonado", tone: "slate" },
};

const audit: Record<string, StatusMeta> = {
  allow: { label: "Permitido", tone: "green" },
  block: { label: "Bloqueado", tone: "red" },
};

const node: Record<string, StatusMeta> = {
  observed: { label: "Observado", tone: "slate" },
  confirmed: { label: "Confirmado", tone: "green" },
  tombstoned: { label: "Descartado", tone: "neutral" },
};

const maps = {
  intent,
  task,
  severity,
  finding,
  engine,
  goal,
  audit,
  node,
} as const;

export type StatusDomain = keyof typeof maps;

export function statusMeta(domain: StatusDomain, key: string): StatusMeta {
  return maps[domain][key] ?? { label: key, tone: "neutral" };
}
