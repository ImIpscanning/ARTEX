import {
  Activity,
  Bot,
  Brain,
  Bug,
  ClipboardList,
  FolderOpen,
  FolderSync,
  LayoutDashboard,
  type LucideIcon,
  MessageSquare,
  Network,
  Plug,
  Radar,
  Radio,
  ScrollText,
  Settings2,
  ShieldAlert,
  Sparkles,
  Target,
  Terminal,
  Wrench,
} from "lucide-react";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Funciones",
    items: [
      { id: "dashboard", title: "Panel de control", url: "/dashboard", icon: LayoutDashboard },
      { id: "chat", title: "Chat", url: "/chat", icon: MessageSquare },
      { id: "tasks", title: "Tareas", url: "/function/tasks", icon: Target },
      { id: "findings", title: "Hallazgos", url: "/function/findings", icon: Bug },
      { id: "traffic", title: "Tráfico", url: "/function/traffic", icon: Activity },
      { id: "commands", title: "Ejecuciones", url: "/function/commands", icon: Terminal },
      { id: "llm-records", title: "Registros de LLM", url: "/function/llm-records", icon: Radio },
      { id: "assets", title: "Activos", url: "/function/assets", icon: Network },
      { id: "sync", title: "Sincronización de activos", url: "/function/sync", icon: FolderSync },
      { id: "workspace", title: "Espacio de trabajo", url: "/function/workspace", icon: FolderOpen },
      { id: "intranet", title: "Red interna", url: "/intranet", icon: Radar },
    ],
  },
  {
    id: 2,
    label: "Sistema",
    items: [
      { id: "llm", title: "LLM", url: "/system/llm", icon: Brain },
      { id: "agents", title: "Agent", url: "/system/agents", icon: Bot },
      { id: "mcp", title: "MCP", url: "/system/mcp", icon: Plug },
      { id: "skills", title: "Skill", url: "/system/skills", icon: Sparkles },
      { id: "tools", title: "Herramientas", url: "/system/tools", icon: Wrench },
      { id: "intercept", title: "Reglas de interceptación", url: "/system/intercept", icon: ShieldAlert },
      { id: "approvals", title: "Historial de aprobaciones", url: "/system/intercept/approvals", icon: ClipboardList },
      { id: "logs", title: "Registros", url: "/system/logs", icon: ScrollText },
      { id: "settings", title: "Configuración del sistema", url: "/system/settings", icon: Settings2 },
    ],
  },
];
