"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/Sidebar";
import { WeekNav } from "@/components/WeekNav";
import { WeekCalendar } from "@/components/WeekCalendar";
import { NewTaskDialog } from "@/components/NewTaskDialog";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";
import { addDays, getWeekStart } from "@/lib/format";

export default function HomePage() {
  const { user, token, ready, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !token) router.replace("/login");
  }, [ready, token, router]);

  if (!ready || !token || !user) {
    return <div className="min-h-screen bg-page" />;
  }

  return <Organiser token={token} userId={user.id} userName={user.name} onLogout={logout} />;
}

function Organiser({
  token,
  userId,
  userName,
  onLogout,
}: {
  token: string;
  userId: string;
  userName: string;
  onLogout: () => void;
}) {
  const tasks = useQuery(api.tasks.list, { token });
  const users = useQuery(api.users.list, { token });
  const me = useQuery(api.users.me, { token });
  const canCreatePrivate = me?.canCreatePrivate ?? false;
  const latestComments = useQuery(api.comments.latestForAllTasks, { token });
  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);
  const removeTask = useMutation(api.tasks.remove);

  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [newTaskAt, setNewTaskAt] = useState<Date | null>(null);
  const [selectedTask, setSelectedTask] = useState<Doc<"tasks"> | null>(null);

  const userNames = useMemo(() => {
    const map = new Map<Id<"users">, string>();
    users?.forEach((u) => map.set(u.id, u.name));
    return map;
  }, [users]);

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    const query = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (assigneeFilter !== "all" && t.assignedTo !== assigneeFilter) return false;
      if (!query) return true;
      return t.title.toLowerCase().includes(query) || t.tags.some((tag) => tag.toLowerCase().includes(query));
    });
  }, [tasks, search, assigneeFilter]);

  // Keep the open detail panel in sync as the underlying task list updates.
  useEffect(() => {
    if (!selectedTask || !tasks) return;
    const fresh = tasks.find((t) => t._id === selectedTask._id);
    setSelectedTask(fresh ?? null);
  }, [tasks, selectedTask]);

  return (
    <div className="flex h-screen bg-page">
      <Sidebar
        search={search}
        onSearchChange={setSearch}
        users={users ?? []}
        assigneeFilter={assigneeFilter}
        onAssigneeFilterChange={setAssigneeFilter}
        onNewTask={() => setNewTaskAt(new Date())}
        userName={userName}
        onLogout={onLogout}
      />

      <main className="flex flex-1 flex-col overflow-hidden px-8 py-6">
        <WeekNav
          weekStart={weekStart}
          onPrev={() => setWeekStart((w) => addDays(w, -7))}
          onNext={() => setWeekStart((w) => addDays(w, 7))}
          onToday={() => setWeekStart(getWeekStart(new Date()))}
        />

        {tasks === undefined ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : (
          <WeekCalendar
            weekStart={weekStart}
            tasks={filteredTasks}
            userNames={userNames}
            latestComments={latestComments ?? {}}
            onSelect={setSelectedTask}
            onReschedule={(taskId, newStartTime) => updateTask({ token, taskId, startTime: newStartTime })}
            onCreateAtSlot={(day, minutes) => {
              const at = new Date(day);
              at.setHours(0, minutes, 0, 0);
              setNewTaskAt(at);
            }}
          />
        )}
      </main>

      {newTaskAt && (
        <NewTaskDialog
          users={users ?? []}
          canCreatePrivate={canCreatePrivate}
          initialStart={newTaskAt}
          onClose={() => setNewTaskAt(null)}
          onCreate={async (input) => {
            await createTask({ token, ...input });
          }}
        />
      )}

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          token={token}
          currentUserId={userId}
          users={users ?? []}
          canCreatePrivate={canCreatePrivate}
          onClose={() => setSelectedTask(null)}
          onDelete={() => {
            void removeTask({ token, taskId: selectedTask._id });
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}
