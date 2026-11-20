// app.js — boots the Leonida Ledger: loads the trophy data, wires the
// filters, the spoiler setting, progress saving and export / import, and
// keeps the checklist, the progress header and the guide pane in sync.
import { loadEarned, saveEarned, exportText, parseImport, download } from './store.js';
import { visibleTrophies } from './filters.js';
import { renderCards, renderDetail, renderProgress } from './render.js';
import { renderRoadmap } from './roadmap.js';

const $ = (id) => document.getElementById(id);

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
const byName = new Map(trophies.map((t) => [t.name, t]));
const knownIds = new Set(trophies.map((t) => t.id));

let earned = loadEarned();
let selectedId = byName.get('Positive Mental Attitude')?.id ?? trophies[0].id;

const settings = { search: '', kind: 'all', grade: 'all', hideEarned: false, missableOnly: false, spoiler: false };

function readSettings() {
  settings.search = $('search').value;
  settings.kind = $('kind').value;
  settings.grade = $('grade').value;
  settings.hideEarned = $('hide-earned').checked;
  settings.missableOnly = $('missable-only').checked;
  settings.spoiler = $('spoiler').checked;
}

function renderAll() {
  readSettings();
  const shown = visibleTrophies(trophies, earned, settings);
  renderProgress(trophies, earned);
  renderCards($('cards'), shown, trophies.length, earned, settings.spoiler, selectedId,
    (id) => {
      if (earned.has(id)) earned.delete(id); else earned.add(id);
      saveEarned(earned);
      renderAll();
    },
    (id) => { selectedId = id; renderAll(); },
  );
  renderDetail($('detail-body'), byId.get(selectedId), earned, settings.spoiler);
}

$('search').addEventListener('input', renderAll);
$('kind').addEventListener('change', renderAll);
$('grade').addEventListener('change', renderAll);
$('hide-earned').addEventListener('change', renderAll);
$('missable-only').addEventListener('change', renderAll);
$('spoiler').addEventListener('change', renderAll);

$('export').addEventListener('click', () => {
  download('leonida-ledger-progress.json', exportText(earned));
});

$('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    earned = parseImport(await file.text(), knownIds);
    saveEarned(earned);
    renderAll();
  } catch (err) {
    alert(`Could not import that file: ${err.message}`);
  }
  event.target.value = '';
});

$('reset').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies? This cannot be undone.')) return;
  earned = new Set();
  saveEarned(earned);
  renderAll();
});

$('show-missable').addEventListener('click', () => {
  settings.missableOnly = true;
  $('missable-only').checked = true;
  $('kind').value = 'all';
  selectedId = byName.get('Positive Mental Attitude').id;
  renderAll();
  $('cards').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

renderRoadmap($('roadmap-steps'), byName);
renderAll();
