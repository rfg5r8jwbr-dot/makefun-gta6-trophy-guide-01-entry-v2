// filters.js — which trophies the checklist shows, and what the spoiler
// setting hides. One trophy is the single source of truth for "hidden":
// a story trophy the reader has not earned yet, while spoilers are on.
export function isSpoilerHidden(trophy, earned, spoilerOn) {
  return spoilerOn && trophy.kind === 'story' && !earned.has(trophy.id);
}

export function visibleTrophies(trophies, earned, settings) {
  const needle = settings.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (settings.kind !== 'all' && t.kind !== settings.kind) return false;
    if (settings.grade !== 'all' && t.grade !== settings.grade) return false;
    if (settings.hideEarned && earned.has(t.id)) return false;
    if (settings.missableOnly && !t.missable) return false;
    if (needle) {
      const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}

export function gradeCounts(trophies, earned) {
  const counts = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const t of trophies) {
    counts[t.grade][1] += 1;
    if (earned.has(t.id)) counts[t.grade][0] += 1;
  }
  return counts;
}
