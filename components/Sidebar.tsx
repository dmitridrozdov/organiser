import { Id } from "@/convex/_generated/dataModel";
import { ThemeToggle } from "./ThemeToggle";

export function Sidebar({
  search,
  onSearchChange,
  users,
  assigneeFilter,
  onAssigneeFilterChange,
  onNewTask,
  userName,
  onLogout,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  users: { id: Id<"users">; name: string }[];
  assigneeFilter: string;
  onAssigneeFilterChange: (v: string) => void;
  onNewTask: () => void;
  userName: string;
  onLogout: () => void;
}) {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col justify-between border-r border-line bg-surface px-6 py-8">
      <div>
        <p className="font-serif text-3xl italic text-ink">Almanac</p>

        <button
          onClick={onNewTask}
          className="mt-7 w-full rounded-lg bg-charcoal py-2.5 text-sm font-medium text-on-charcoal transition-colors hover:bg-charcoal-hover"
        >
          + New task
        </button>

        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks or tags…"
          className="mt-6 w-full rounded-lg border border-line bg-page px-3 py-2 text-sm text-ink outline-none placeholder:text-muted/70 focus-visible:border-charcoal"
        />

        <div className="mt-7">
          <p className="text-xs uppercase tracking-wider text-muted">Assigned to</p>
          <div className="mt-2.5 flex flex-col gap-1">
            <button
              onClick={() => onAssigneeFilterChange("all")}
              className={`rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                assigneeFilter === "all" ? "bg-surface-muted text-ink" : "text-muted hover:text-ink"
              }`}
            >
              Everyone
            </button>
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => onAssigneeFilterChange(u.id)}
                className={`rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                  assigneeFilter === u.id ? "bg-surface-muted text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {u.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between border-t border-line pt-4">
        <div>
          <p className="text-sm text-ink">{userName}</p>
          <button
            onClick={onLogout}
            className="mt-1 text-xs text-muted underline decoration-line underline-offset-2 hover:text-ink"
          >
            Sign out
          </button>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}
