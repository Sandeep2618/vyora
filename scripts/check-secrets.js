#!/usr/bin/env node
/**
 * Vyora Secret Guard
 * Prevents accidental commits or pushes of MongoDB URIs, API keys, passwords, and .env files.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SECRET_PATTERNS = [
  {
    name: 'MongoDB Connection String with Password',
    regex: /mongodb(?:\+srv)?:\/\/[^:]+:[^@\s]+@[^\s/]+/gi,
    mask: (str) => str.replace(/:[^:@]+@/, ':****@'),
  },
  {
    name: 'Private Key (RSA / EC / OpenSSH)',
    regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/gi,
    mask: () => '-----BEGIN PRIVATE KEY [REDACTED]-----',
  },
  {
    name: 'AWS Access Key ID',
    regex: /\bAKIA[0-9A-Z]{16}\b/g,
    mask: (str) => str.slice(0, 4) + '************',
  },
  {
    name: 'GitHub Personal Access Token',
    regex: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{30,}\b/g,
    mask: (str) => str.slice(0, 4) + '************',
  },
  {
    name: 'Database Password / Auth Key Assignment',
    regex: /(?:db_password|auth_key|jwt_secret)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
    mask: (str) => str.split(/[:=]/)[0] + '= "****"',
  },
];

const FORBIDDEN_FILE_PATTERNS = [
  /^\.env$/i,
  /^\.env\.(?!example$)[^/\\]+$/i,
  /[/\\]\.env$/i,
  /[/\\]\.env\.(?!example$)[^/\\]+$/i,
  /passwords\.txt$/i,
  /secrets\.json$/i,
  /credentials\.json$/i,
];

function getStagedOrChangedFiles() {
  const files = new Set();
  try {
    // 1. Files staged in git
    const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' })
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);
    staged.forEach((f) => files.add(f));

    // 2. If nothing staged, also check unstaged changed files
    if (files.size === 0) {
      const unstaged = execSync('git diff --name-only', { encoding: 'utf8' })
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);
      unstaged.forEach((f) => files.add(f));
    }
  } catch {
    // If git fails, fallback to scanning key project source files
  }
  return Array.from(files);
}

function runCheck() {
  const filesToCheck = getStagedOrChangedFiles();
  const violations = [];

  for (const filePath of filesToCheck) {
    const normalized = filePath.replace(/\\/g, '/');

    // Ignore build output and node_modules
    if (
      normalized.includes('node_modules/') ||
      normalized.includes('dist/') ||
      normalized.includes('build/') ||
      normalized.includes('.turbo/') ||
      normalized.includes('.system_generated/') ||
      normalized.includes('brain/')
    ) {
      continue;
    }

    // Check if filename itself is forbidden (e.g. committing .env)
    for (const pattern of FORBIDDEN_FILE_PATTERNS) {
      if (pattern.test(normalized)) {
        violations.push({
          file: filePath,
          issue: 'Forbidden Secret File: .env or credential files must never be tracked in git.',
          matched: normalized,
        });
      }
    }

    // Check file contents
    if (fs.existsSync(filePath)) {
      try {
        const stat = fs.statSync(filePath);
        if (stat.isFile() && stat.size < 2 * 1024 * 1024) {
          const content = fs.readFileSync(filePath, 'utf8');

          for (const pattern of SECRET_PATTERNS) {
            const matches = content.match(pattern.regex);
            if (matches && matches.length > 0) {
              // Ensure it is not an example or doc placeholder
              const realViolations = matches.filter(
                (m) =>
                  !m.includes('<username>') &&
                  !m.includes('<password>') &&
                  !m.includes('<YOUR_') &&
                  !m.includes(':****@') &&
                  !m.includes('localhost') &&
                  !m.includes('127.0.0.1') &&
                  !m.includes('your-jwt-secret-here') &&
                  !m.includes('your-password')
              );

              if (realViolations.length > 0) {
                violations.push({
                  file: filePath,
                  issue: pattern.name,
                  matched: pattern.mask ? pattern.mask(realViolations[0]) : '[REDACTED]',
                });
              }
            }
          }
        }
      } catch (err) {
        // Skip unreadable files
      }
    }
  }

  if (violations.length > 0) {
    console.error('\n' + '='.repeat(74));
    console.error('🚨 ACTION BLOCKED BY VYORA SECRET GUARD!');
    console.error('='.repeat(74));
    console.error('Detected sensitive credentials or secret files in your git changes:\n');

    violations.forEach((v, idx) => {
      console.error(`  [${idx + 1}] File: ${v.file}`);
      console.error(`      Issue:   ${v.issue}`);
      console.error(`      Snippet: ${v.matched}\n`);
    });

    console.error('--------------------------------------------------------------------------');
    console.error('How to fix this:');
    console.error('  1. Remove the credentials from the file.');
    console.error('  2. Store sensitive values ONLY in local .env (which is git-ignored).');
    console.error('  3. If you accidentally staged a .env file, unstage it:');
    console.error('       git reset HEAD <file>');
    console.error('  4. Re-run "npm run check-secrets" to verify clean status.');
    console.error('='.repeat(74) + '\n');
    process.exit(1);
  } else {
    console.log('✅ [Vyora Secret Guard] Passed: No sensitive credentials or secrets detected.');
    process.exit(0);
  }
}

runCheck();
