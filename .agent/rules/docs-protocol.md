# Documentation Protocol Rule

> Enforces module documentation lifecycle and gate management.

1. **Location**: Every module lives in `docs/modules/<module-name>/` with standard subfolders (`01-research`, `02-plan`, `03-architecture`, `04-execution`, `05-review`, `06-gaps`).
2. **Never Overwrite History**: Every topic gets its own `.md` file. Never overwrite past iterations; append notes, reviews, and logs.
3. **Follow-Up Log Invariant**: Follow-up questions, design discussions, or chat clarifications about research go into that module's `01-research/research.md` under the `## Follow-up Log` section with a timestamp and the question/answer pair.
4. **Status Ledger**: Update `status.md` after every phase (phase name, timestamp, approved: yes/no, notes).
5. **Selective Execution**: Do NOT run the research/plan/build pipeline unless the user explicitly runs `/module <name>: <idea>`. For everyday edits or bug fixes, simply follow the standards in `docs/00-standards/` and execute the task directly.
