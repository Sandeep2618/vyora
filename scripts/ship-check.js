/**
 * Vyora Release Readiness & Pre-Flight Gatekeeper (/ship or /verify-all)
 * Executes secrets check, UI audit, full QA functional suite, and TypeScript compilations.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const REPORT_DIR = path.join(ROOT_DIR, 'docs', 'qa-reports');

if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

console.log('🚀 Initiating Vyora Pre-Flight Release Readiness Audit...\n');

const checks = [];

function runStep(name, cmd) {
  console.log(`\n⏳ Running: ${name}...`);
  try {
    const output = execSync(cmd, { cwd: ROOT_DIR, stdio: 'pipe', encoding: 'utf8' });
    console.log(`✅ [PASS] ${name}`);
    checks.push({ name, pass: true, output });
    return true;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}`);
    const errOutput = (err.stdout || '') + '\n' + (err.stderr || '') + '\n' + (err.message || '');
    console.error(errOutput.trim());
    checks.push({ name, pass: false, error: errOutput.trim() });
    return false;
  }
}

// Step 1: Secrets Verification
runStep('Zero-Secrets & Credentials Audit', 'node scripts/check-secrets.js');

// Step 2: UI & Design System Audit
runStep('UI & Modal Invariant Audit', 'node scripts/audit-ui.js');

// Step 3: Complete QA Functional Suite
runStep('Automated QA Multi-Module Suite', 'node scripts/qa-runner.js --module all');

// Step 4: Backend TypeScript Check
runStep('Backend TypeScript Build', 'pnpm --dir vyora-backend build');

// Step 5: Frontend TypeScript Check
runStep('Frontend Vite / React Build', 'pnpm --dir vyora-frontend build');

// Step 6: Generate Release Report
const allPassed = checks.every(c => c.pass);
let reportMd = `# Vyora Release Readiness Report\n\n`;
reportMd += `**Generated**: ${new Date().toISOString()}  \n`;
reportMd += `**Overall Release Verdict**: ${allPassed ? '🟢 READY TO SHIP' : '🔴 BLOCKED BY CHECKS'}  \n\n`;
reportMd += `| Gatekeeper Check | Status | Result |\n`;
reportMd += `| :--- | :---: | :--- |\n`;

checks.forEach(c => {
  reportMd += `| ${c.name} | ${c.pass ? '✅ PASS' : '❌ FAIL'} | ${c.pass ? 'Compliant with Vyora Core standard' : 'Action Required'} |\n`;
});

reportMd += `\n> [!NOTE]\n`;
reportMd += `> Reminder: In accordance with repository constraints, **git push is never executed automatically**.\n`;
reportMd += `> After reviewing this sign-off, push your branch manually when ready.\n`;

const reportPath = path.join(REPORT_DIR, 'RELEASE_READINESS.md');
fs.writeFileSync(reportPath, reportMd, 'utf8');

console.log('\n======================================================');
console.log(`🏁 PRE-FLIGHT VERDICT: ${allPassed ? '🟢 READY TO SHIP (5/5 PASSED)' : '🔴 BLOCKED'}`);
console.log(`📄 Sign-Off Report : ${reportPath}`);
console.log('======================================================\n');

if (!allPassed) {
  process.exit(1);
} else {
  process.exit(0);
}
