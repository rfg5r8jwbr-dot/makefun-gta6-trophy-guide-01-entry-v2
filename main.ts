// Leonida Ledger — a GTA 6 trophy guide and tracker (Node 22, standard
// library only). The guide is this directory's app/ folder: plain static
// files a browser opens at app/index.html (ES modules, CSS, no build step),
// offline — it loads nothing over the network, and its trophy list and
// guides are app/data/trophies.json. This program hands it in: it copies
// app/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads, with the vendored
// make.fun library. Leave vendor/makefun-frontend.ts as it is: the scorer
// requires dossier.json to be byte for byte what its own copy writes.
//
// Before copying anything it validates the entry, and fails the build
// rather than handing in a broken guide: dossier.json must be writable,
// trophies.json must parse and hold exactly 55 trophies, every trophy must
// have a non-empty name and guide and at least one source, and every app
// file and screenshot must exist and be non-empty.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const EXPECTED_TROPHIES = 55;

function fail(message) {
  throw new Error(`build failed: ${message}`);
}

function checkNonEmptyFile(path, label) {
  if (!existsSync(path)) fail(`${label} is missing: ${path}`);
  const stats = statSync(path);
  if (!stats.isFile() || stats.size === 0) fail(`${label} is empty or not a file: ${path}`);
}

// Every file under a directory must exist and be non-empty; returns the
// count so the summary can report it.
function checkTreeNonEmpty(dir, label) {
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) count += checkTreeNonEmpty(path, label);
    else if (entry.isFile()) {
      checkNonEmptyFile(path, `${label} file`);
      count += 1;
    } else fail(`${label} holds a non-file entry: ${path}`);
  }
  return count;
}

function validateTrophies() {
  const path = join(here, 'app', 'data', 'trophies.json');
  checkNonEmptyFile(path, 'trophies.json');
  let doc;
  try {
    doc = JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    fail(`trophies.json does not parse: ${err.message}`);
  }
  const list = Array.isArray(doc) ? doc : doc.trophies;
  if (!Array.isArray(list)) fail('trophies.json has no trophies array');
  if (list.length !== EXPECTED_TROPHIES) {
    fail(`trophies.json holds ${list.length} trophies, expected ${EXPECTED_TROPHIES}`);
  }
  const grades = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const seenNames = new Set();
  for (const [index, t] of list.entries()) {
    const where = `trophy ${index + 1}`;
    if (!t || typeof t.name !== 'string' || t.name.trim() === '') fail(`${where} has no name`);
    if (typeof t.guide !== 'string' || t.guide.trim() === '') fail(`${where} (${t.name}) has no guide`);
    if (!Array.isArray(t.sources) || t.sources.length === 0) fail(`${where} (${t.name}) cites no source`);
    if (seenNames.has(t.name)) fail(`duplicate trophy name: ${t.name}`);
    seenNames.add(t.name);
    for (const s of t.sources) {
      if (!s || typeof s.url !== 'string' || !s.url.startsWith('https://')) {
        fail(`${where} (${t.name}) has a source without an https URL`);
      }
    }
    if (t.grade in grades) grades[t.grade] += 1;
  }
  return grades;
}

const grades = validateTrophies();
const appFiles = checkTreeNonEmpty(join(here, 'app'), 'app');
const shotDir = join(here, 'screenshots');
if (!existsSync(shotDir)) fail('screenshots/ is missing');
const shotFiles = readdirSync(shotDir).filter((name) => !name.startsWith('.'));
if (shotFiles.length < 3 || shotFiles.length > 4) {
  fail(`screenshots/ holds ${shotFiles.length} images, expected 3 or 4`);
}
for (const name of shotFiles) {
  checkNonEmptyFile(join(shotDir, name), `screenshot ${name}`);
  const bytes = statSync(join(shotDir, name)).size;
  if (bytes > 262144) fail(`screenshot ${name} is ${bytes} bytes, over the 256 KiB cap`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);

// buildDossier writes the dossier; confirm it landed and parses before
// calling the build a success.
const dossierPath = join(out, 'dossier.json');
checkNonEmptyFile(dossierPath, 'dossier.json');
try {
  JSON.parse(readFileSync(dossierPath, 'utf8'));
} catch (err) {
  fail(`dossier.json does not parse: ${err.message}`);
}

console.log(
  `Leonida Ledger build OK: ${EXPECTED_TROPHIES} trophies ` +
    `(platinum ${grades.platinum}, gold ${grades.gold}, silver ${grades.silver}, bronze ${grades.bronze}), ` +
    `${appFiles} app files, ${shotFiles.length} screenshots -> ${out}`,
);
