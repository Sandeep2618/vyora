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

comps.forEach(c => {
  const constFile = path.join(c, 'config', 'constant', 'index.ts');
  if (fs.existsSync(constFile)) {
    const content = fs.readFileSync(constFile, 'utf-8').trim();
    const rel = path.relative('C:/Users/sande/vyora/vyora-frontend/src', c);
    console.log(rel + ':\n  ' + content.replace(/\n/g, '\n  '));
  }
});
