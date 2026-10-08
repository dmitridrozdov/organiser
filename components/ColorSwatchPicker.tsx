import { TASK_COLOR_KEYS, TASK_COLORS, TaskColor } from "@/lib/colors";

export function ColorSwatchPicker({ value, onChange }: { value: TaskColor; onChange: (c: TaskColor) => void }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-2">
      {TASK_COLOR_KEYS.map((key) => {
        const palette = TASK_COLORS[key];
        const selected = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            title={palette.label}
            aria-label={palette.label}
            className={`h-7 w-7 rounded-full transition-transform ${selected ? "scale-110 ring-2 ring-charcoal ring-offset-2" : "hover:scale-105"}`}
            style={{ backgroundColor: palette.border }}
          />
        );
      })}
    </div>
  );
}
