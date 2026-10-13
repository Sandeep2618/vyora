const fs = require('fs');
const path = require('path');

function findComponents(dir, list = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (fs.existsSync(path.join(full, 'component', 'index.tsx'))) {
        list.push(full);
      } else {
        findComponents(full, list);
      }
    }
  }
  return list;
}

const comps = findComponents('C:/Users/sande/vyora/vyora-frontend/src');

function checkFile(filePath) {
  if (!fs.existsSync(filePath)) return { exists: false, empty: true, content: '' };
  const content = fs.readFileSync(filePath, 'utf-8').trim();
  const empty = (
    content === 'export {};' ||
    content === 'export {}' ||
    content === '' ||
    /^export enum \w+ \{\s*DEFAULT = ['"]DEFAULT['"],?\s*\}$/.test(content)
  );
  return { exists: true, empty, content };
}

let emptyHooks = 0, realHooks = [];
let emptyUtils = 0, realUtils = [];
let emptyEnums = 0, realEnums = [];
let emptyConstants = 0, realConstants = [];

comps.forEach(c => {
  const rel = path.relative('C:/Users/sande/vyora/vyora-frontend/src', c);
  const hook = checkFile(path.join(c, 'hook', 'index.ts'));
  if (hook.exists) { if (hook.empty) emptyHooks++; else realHooks.push(rel); }

  const util = checkFile(path.join(c, 'util', 'index.ts'));
  if (util.exists) { if (util.empty) emptyUtils++; else realUtils.push(rel); }

  const en = checkFile(path.join(c, 'config', 'enum', 'index.ts'));
  if (en.exists) { if (en.empty) emptyEnums++; else realEnums.push(rel); }

  const constFile = checkFile(path.join(c, 'config', 'constant', 'index.ts'));
  if (constFile.exists) { if (constFile.empty) emptyConstants++; else realConstants.push(rel); }
});

console.log('REAL HOOKS:', realHooks);
console.log('REAL UTILS:', realUtils);
console.log('REAL ENUMS:', realEnums);
console.log('REAL CONSTANTS (count):', realConstants.length);
console.log('EMPTY COUNTS:', { emptyHooks, emptyUtils, emptyEnums, emptyConstants });
