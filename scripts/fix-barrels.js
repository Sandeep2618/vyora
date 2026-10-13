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
let updatedCount = 0;
comps.forEach(c => {
  const barrel = path.join(c, 'index.ts');
  if (fs.existsSync(barrel)) {
    let content = fs.readFileSync(barrel, 'utf-8');
    if (/^export \{ \w+ \} from '\.\/component';/m.test(content)) {
      content = content.replace(/^export \{ \w+ \} from '\.\/component';/m, "export * from './component';");
      fs.writeFileSync(barrel, content);
      updatedCount++;
    }
  }
});
console.log(`Updated ${updatedCount} component barrels to export * from ./component`);
