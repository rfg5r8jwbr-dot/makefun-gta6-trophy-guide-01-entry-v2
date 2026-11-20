// roadmap.js — the three-stage platinum roadmap, built from the official
// trophy descriptions and PowerPyx's roadmap (about 200 hours, difficulty
// 4 out of 10, one playthrough, cheats off). Rendered into #roadmap-steps.
export const ROADMAP_STAGES = [
  {
    title: 'Stage 1 — Finish the story, and do the one missable thing',
    hours: '60–80 hours',
    text: 'Play the five chapters through to the final mission. The 12 story trophies pop on their own, and progress toward the 100% checklist already counts even though the checklist only becomes visible after the story. Scan vehicles and study animals with the binoculars as you go (200 of 277 vehicles and 100 of 255 animals are needed later). Do the Chapter 1 balcony meditation for Positive Mental Attitude, and keep a manual save from the start of each chapter, since there is no mission replay.',
    trophyNames: ['Just Like Paradise', 'You Gotta Know When to Get Off', 'Positive Mental Attitude', 'Whip It Good'],
  },
  {
    title: 'Stage 2 — The 100% completion checklist',
    hours: 'about 100 hours',
    text: 'After the story, open Progress, then Stats, then 100% Completion and work down the list: all robberies, underwater discoveries, shooting ranges, drone races and Bret’s quests, plus 70 of 80 challenges. The checklist is forgiving, closer to 60% true completion, and nothing on it is missable. This stage pops the gold A Long Road and most of the activity, robbery and collectible trophies with it.',
    trophyNames: ['A Long Road', 'Cunning Stunts', 'The Shootist', 'Maximum Withdrawal', 'Pest Control', 'One Last Thing'],
  },
  {
    title: 'Stage 3 — Stranger strands and cleanup',
    hours: 'about 10 hours',
    text: 'Finish the 8 qualifying Strangers & Freaks strands, which the 100% checklist does not require, then sweep up whatever is left: the card sets, the WAiNK scans, the meditation spots, the garages and the money trophies. Check the filters on this page, hide what you have earned, and work the remainder one kind at a time until the platinum pops.',
    trophyNames: ['Strangers & Freaks', 'Don’t Touch My Deck', 'You WAiNKer!', 'Little Boxes', 'Vice Got a Price!'],
  },
];

export function renderRoadmap(listEl, trophiesByName) {
  listEl.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const li = document.createElement('li');
    const title = document.createElement('div');
    title.className = 'stage-title';
    title.textContent = stage.title;
    const hours = document.createElement('div');
    hours.className = 'stage-hours';
    hours.textContent = stage.hours;
    const text = document.createElement('p');
    text.textContent = stage.text;
    const names = document.createElement('p');
    names.className = 'fine';
    names.textContent = 'Key trophies: ' + stage.trophyNames.filter((n) => trophiesByName.has(n)).join(', ') + '.';
    li.append(title, hours, text, names);
    listEl.append(li);
  }
}
