export type LaneInfo = { lane: number; lanes: number };

// A block is drawn at least ~24 minutes tall (22px), so treat it as occupying that much time.
const MIN_VISIBLE_MINUTES = 24;

/**
 * Splits overlapping tasks into side-by-side lanes (like Outlook).
 * Tasks that overlap in time share the column width equally; tasks that
 * don't overlap anything keep the full width.
 */
export function layoutOverlaps(
  tasks: { _id: string; startTime: number; durationMinutes: number }[]
): Record<string, LaneInfo> {
  const sorted = [...tasks].sort((a, b) => a.startTime - b.startTime || b.durationMinutes - a.durationMinutes);
  const endOf = (t: { startTime: number; durationMinutes: number }) =>
    t.startTime + Math.max(t.durationMinutes, MIN_VISIBLE_MINUTES) * 60_000;

  const result: Record<string, LaneInfo> = {};
  let cluster: string[] = [];
  let laneEnds: number[] = [];
  let clusterEnd = -Infinity;

  function closeCluster() {
    for (const id of cluster) result[id].lanes = laneEnds.length;
    cluster = [];
    laneEnds = [];
    clusterEnd = -Infinity;
  }

  for (const task of sorted) {
    if (task.startTime >= clusterEnd) closeCluster();

    let lane = laneEnds.findIndex((end) => end <= task.startTime);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(0);
    }
    laneEnds[lane] = endOf(task);
    clusterEnd = Math.max(clusterEnd, endOf(task));
    cluster.push(task._id);
    result[task._id] = { lane, lanes: 1 };
  }
  closeCluster();

  return result;
}