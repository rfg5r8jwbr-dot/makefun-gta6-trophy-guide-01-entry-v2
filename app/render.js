// render.js — draws the checklist cards, the progress header and the guide
// pane. Cards show the official name, description and grade; the guide pane
// shows the guide in our own words plus its cited sources. Spoiler-hidden
// story trophies show neither name nor description until earned.
import { gradeCounts, isSpoilerHidden } from './filters.js';

const GRADE_LETTER = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };
const KIND_LABEL = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', other: 'Other' };

export function renderProgress(trophies, earned) {
  const total = trophies.length;
  const done = earned.size;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  document.getElementById('earned-count').textContent = String(done);
  document.getElementById('progress-label').textContent = `trophies earned · ${pct}% · ${total - done} to go`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
  const counts = gradeCounts(trophies, earned);
  const list = document.getElementById('grade-counts');
  list.replaceChildren();
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const [have, all] = counts[grade];
    const li = document.createElement('li');
    li.innerHTML = '';
    const b = document.createElement('b');
    b.textContent = `${have}/${all}`;
    li.append(b, document.createTextNode(` ${grade}`));
    list.append(li);
  }
}

export function renderCards(container, shown, total, earned, spoilerOn, selectedId, onToggle, onSelect) {
  container.replaceChildren();
  for (const t of shown) {
    const hidden = isSpoilerHidden(t, earned, spoilerOn);
    const card = document.createElement('article');
    card.className = 'card' + (earned.has(t.id) ? ' earned' : '') + (t.id === selectedId ? ' selected' : '') + (hidden ? ' hidden-spoiler' : '');
    card.dataset.trophyId = String(t.id);

    const tick = document.createElement('input');
    tick.type = 'checkbox';
    tick.checked = earned.has(t.id);
    tick.setAttribute('aria-label', `Mark ${hidden ? 'hidden story trophy' : t.name} as earned`);
    tick.addEventListener('change', () => onToggle(t.id));

    const head = document.createElement('div');
    head.className = 'card-head';
    const name = document.createElement('span');
    name.className = 'card-name';
    name.textContent = hidden ? 'Hidden story trophy' : t.name;
    const dot = document.createElement('span');
    dot.className = `grade-dot ${t.grade}`;
    dot.textContent = GRADE_LETTER[t.grade];
    dot.title = t.grade;
    head.append(tick, name, dot);

    const desc = document.createElement('p');
    desc.className = 'card-desc';
    desc.textContent = hidden ? 'Spoilers are on — earn this trophy to reveal it.' : t.description;

    const meta = document.createElement('div');
    meta.className = 'card-meta';
    const kind = document.createElement('span');
    kind.className = 'chip';
    kind.textContent = KIND_LABEL[t.kind] ?? t.kind;
    meta.append(kind);
    if (t.missable) {
      const flag = document.createElement('span');
      flag.className = 'chip missable';
      flag.textContent = 'Possibly missable';
      meta.append(flag);
    }
    const state = document.createElement('span');
    state.className = 'card-tick';
    state.textContent = earned.has(t.id) ? '✓ Earned' : 'Not earned yet';
    meta.append(state);

    card.append(head, desc, meta);
    card.addEventListener('click', (event) => {
      if (event.target === tick) return;
      onSelect(t.id);
    });
    container.append(card);
  }
  document.getElementById('empty-state').hidden = shown.length !== 0;
  document.getElementById('result-count').textContent = `Showing ${shown.length} of ${total} trophies`;
}

export function renderDetail(bodyEl, trophy, earned, spoilerOn) {
  bodyEl.replaceChildren();
  if (!trophy) {
    const p = document.createElement('p');
    p.textContent = 'Select a trophy card to read its guide and sources here.';
    bodyEl.append(p);
    return;
  }
  if (isSpoilerHidden(trophy, earned, spoilerOn)) {
    const p = document.createElement('p');
    p.textContent = 'This story trophy is hidden while spoilers are on. Earn it, or turn spoilers off, to read its guide.';
    bodyEl.append(p);
    return;
  }
  const grade = document.createElement('p');
  grade.className = 'fine';
  grade.textContent = `${trophy.grade[0].toUpperCase() + trophy.grade.slice(1)} trophy · ${KIND_LABEL[trophy.kind] ?? trophy.kind}`;
  const name = document.createElement('p');
  name.className = 'detail-name';
  name.textContent = trophy.name;
  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = `Official description: ${trophy.description}`;
  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  guide.textContent = trophy.guide;
  bodyEl.append(grade, name, desc, guide);
  if (trophy.missable) {
    const flag = document.createElement('p');
    flag.className = 'detail-flag';
    flag.textContent = '⚠ Possibly missable — see the callout on this page before Chapter 1 ends.';
    bodyEl.append(flag);
  }
  if (Array.isArray(trophy.sources) && trophy.sources.length > 0) {
    const wrap = document.createElement('div');
    wrap.className = 'detail-sources';
    const head = document.createElement('p');
    head.textContent = 'Sources for this guide:';
    const ul = document.createElement('ul');
    for (const s of trophy.sources) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = s.title;
      a.target = '_blank';
      a.rel = 'noopener';
      li.append(a);
      ul.append(li);
    }
    wrap.append(head, ul);
    bodyEl.append(wrap);
  }
  const earnedLine = document.createElement('p');
  earnedLine.className = 'fine';
  earnedLine.textContent = earned.has(trophy.id)
    ? 'You have ticked this trophy as earned.'
    : 'Not earned yet — tick the box on its card to mark it earned.';
  bodyEl.append(earnedLine);
}
