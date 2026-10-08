export const TASK_COLORS = {
  violet: { label: "Violet", bg: "#EFECFF", border: "#7C6CFF", text: "#5B4FD6" },
  cyan: { label: "Teal", bg: "#E6FBF9", border: "#14B8A6", text: "#0F8F82" },
  coral: { label: "Coral", bg: "#FFEDEF", border: "#FB7185", text: "#E11D48" },
  amber: { label: "Amber", bg: "#FFF6E5", border: "#F59E0B", text: "#B45309" },
  green: { label: "Green", bg: "#EAFBF0", border: "#22C55E", text: "#15803D" },
  blue: { label: "Blue", bg: "#EAF2FF", border: "#3B82F6", text: "#1D4ED8" },
  pink: { label: "Pink", bg: "#FFEEFA", border: "#EC4899", text: "#BE185D" },
  slate: { label: "Slate", bg: "#F1F2F4", border: "#64748B", text: "#334155" },
} as const;

export type TaskColor = keyof typeof TASK_COLORS;

export const TASK_COLOR_KEYS = Object.keys(TASK_COLORS) as TaskColor[];
