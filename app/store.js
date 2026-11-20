// store.js — saved progress: localStorage plus export / import of a JSON file.
// Progress is a set of trophy ids. Nothing leaves the browser except the file
// the reader deliberately exports.
export const STORAGE_KEY = 'leonida-ledger-progress-v2';
export const EXPORT_VERSION = 1;

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n) => Number.isInteger(n)));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

export function exportText(earned) {
  return JSON.stringify(
    { app: 'leonida-ledger', version: EXPORT_VERSION, exportedAt: new Date().toISOString(), earned: [...earned].sort((a, b) => a - b) },
    null,
    2,
  );
}

// Parses an imported file. Accepts our own export shape, or a plain array of ids
// (the shape the starter checklist exported). Throws a readable error otherwise.
export function parseImport(text, knownIds) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error('That file has no earned-trophy list in it.');
  const kept = ids.filter((n) => Number.isInteger(n) && knownIds.has(n));
  if (kept.length === 0 && ids.length > 0) throw new Error('That file lists no trophies from this guide.');
  return new Set(kept);
}

export function download(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
