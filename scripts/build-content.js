#!/usr/bin/env node
/**
 * build-content.js
 * ------------------------------------------------------------------
 * Netlify runs this on every deploy (see netlify.toml).
 *
 * Decap CMS folder collections store one JSON file per item under
 * content/<collection>/*.json — great for editing, but a static host
 * can't "list" a folder at runtime. This script aggregates each
 * collection into a single sorted array at data/<collection>.json,
 * and copies each singleton settings file straight through.
 *
 * The browser (js/script.js) fetches data/*.json at runtime, with a
 * hardcoded fallback baked into the JS for the rare case a fetch
 * fails (e.g. opening index.html directly via file://).
 * ------------------------------------------------------------------
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const DATA_DIR = path.join(ROOT, 'data');

const COLLECTIONS = [
  'vets', 'services', 'wellness-plans', 'gallery',
  'testimonials', 'tips', 'faq', 'awards', 'why-us'
];

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`  ! Failed to parse ${filePath}: ${err.message}`);
    return null;
  }
}

function buildCollections() {
  COLLECTIONS.forEach(name => {
    const dir = path.join(CONTENT_DIR, name);
    if (!fs.existsSync(dir)) {
      console.warn(`- Skipping "${name}": content/${name}/ not found`);
      return;
    }
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    const items = files
      .map(f => readJSON(path.join(dir, f)))
      .filter(Boolean)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    fs.writeFileSync(
      path.join(DATA_DIR, `${name}.json`),
      JSON.stringify(items, null, 2)
    );
    console.log(`- ${name}: ${items.length} item(s) -> data/${name}.json`);
  });
}

function buildSettings() {
  const dir = path.join(CONTENT_DIR, 'settings');
  if (!fs.existsSync(dir)) {
    console.warn('- Skipping settings: content/settings/ not found');
    return;
  }
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  files.forEach(f => {
    const data = readJSON(path.join(dir, f));
    if (!data) return;
    fs.writeFileSync(path.join(DATA_DIR, f), JSON.stringify(data, null, 2));
    console.log(`- settings/${f} -> data/${f}`);
  });
}

function main() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log('Building site content from content/ ...');
  buildSettings();
  buildCollections();
  console.log('Done.');
}

main();
