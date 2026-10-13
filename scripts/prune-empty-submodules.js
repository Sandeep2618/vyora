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
  // 1. Check hook
  const hookDir = path.join(c, 'hook');
  const hookFile = path.join(hookDir, 'index.ts');
  if (fs.existsSync(hookFile)) {
    const content = fs.readFileSync(hookFile, 'utf-8').trim();
    if (content === 'export {};' || content === 'export {}' || content === '') {
      fs.rmSync(hookDir, { recursive: true, force: true });
    }
  }

  // 2. Check util
  const utilDir = path.join(c, 'util');
  const utilFile = path.join(utilDir, 'index.ts');
  if (fs.existsSync(utilFile)) {
    const content = fs.readFileSync(utilFile, 'utf-8').trim();
    if (content === 'export {};' || content === 'export {}' || content === '') {
      fs.rmSync(utilDir, { recursive: true, force: true });
    }
  }

  // 3. Check enum
  const enumDir = path.join(c, 'config', 'enum');
  const enumFile = path.join(enumDir, 'index.ts');
  if (fs.existsSync(enumFile)) {
    const content = fs.readFileSync(enumFile, 'utf-8').trim();
    if (content === 'export {};' || content === 'export {}' || content === '' || /^export enum \w+ \{\s*DEFAULT = ['"]DEFAULT['"],?\s*\}$/.test(content)) {
      fs.rmSync(enumDir, { recursive: true, force: true });
    }
  }

  // 4. If component imported DEFAULT_PAGE_SIZE from config/constant, inline it if constant is just DEFAULT_PAGE_SIZE = 10
  const constDir = path.join(c, 'config', 'constant');
  const constFile = path.join(constDir, 'index.ts');
  if (fs.existsSync(constFile)) {
    const content = fs.readFileSync(constFile, 'utf-8').trim();
    if (content === 'export {};' || content === 'export {}' || content === '') {
      fs.rmSync(constDir, { recursive: true, force: true });
    } else if (content === 'export const DEFAULT_PAGE_SIZE = 10;') {
      // Check if component/index.tsx uses it
      const compFile = path.join(c, 'component', 'index.tsx');
      if (fs.existsSync(compFile)) {
        let compCode = fs.readFileSync(compFile, 'utf-8');
        if (compCode.includes("from '../config/constant'")) {
          compCode = compCode.replace(/import\s*\{\s*DEFAULT_PAGE_SIZE\s*\}\s*from\s*'\.\.\/config\/constant';\n?/, 'const DEFAULT_PAGE_SIZE = 10;\n');
          fs.writeFileSync(compFile, compCode);
        }
      }
      fs.rmSync(constDir, { recursive: true, force: true });
    } else if (/^export const [A-Z_]+_TITLE = '[^']+';$/.test(content)) {
      // Unused dummy title
      fs.rmSync(constDir, { recursive: true, force: true });
    }
  }

  // 5. If config has no files or subdirectories left, remove config
  const configDir = path.join(c, 'config');
  if (fs.existsSync(configDir)) {
    const sub = fs.readdirSync(configDir);
    if (sub.length === 0) {
      fs.rmSync(configDir, { recursive: true, force: true });
    }
  }

  // 6. Rewrite barrel index.ts to only export existing items
  const barrelFile = path.join(c, 'index.ts');
  const compName = path.basename(c);
  let exports = [`export * from './component';`];

  if (fs.existsSync(path.join(c, 'config', 'interface', 'index.ts'))) {
    exports.push(`export * from './config/interface';`);
  }
  if (fs.existsSync(path.join(c, 'config', 'constant', 'index.ts'))) {
    exports.push(`export * from './config/constant';`);
  }
  if (fs.existsSync(path.join(c, 'config', 'enum', 'index.ts'))) {
    exports.push(`export * from './config/enum';`);
  }
  if (fs.existsSync(path.join(c, 'hook', 'index.ts'))) {
    exports.push(`export * from './hook';`);
  }
  if (fs.existsSync(path.join(c, 'util', 'index.ts'))) {
    exports.push(`export * from './util';`);
  }

  fs.writeFileSync(barrelFile, exports.join('\n') + '\n');
});

console.log('Pruned all contentless submodules across components!');
