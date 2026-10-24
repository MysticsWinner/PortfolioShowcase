# Agent Performance & Token Optimization Guidelines

This repository uses **graphify** and modular code-splitting to maintain high performance and low context/token usage.

## Rules for Agents

### 1. Graph-First Architecture Exploration
- **DO NOT** read large raw source code files or blast full directory grep searches when exploring architecture, interfaces, or relationships.
- Use `graphify-out/wiki/index.md` as the entry point to read modular community articles.
- Run `graphify query "<question>"` for BFS architectural traversals, `graphify path "<A>" "<B>"` for dependency traces, or `graphify explain "<concept>"`.
- Use `view_file` strictly with targeted `StartLine` and `EndLine` slices rather than loading full files.

### 2. Selective & Minimal I/O
- Avoid dumping whole file replacements when editing code. Use `replace_file_content` with precise targets or `multi_replace_file_content` for non-contiguous blocks.
- When querying ripgrep with `grep_search`, always filter with `Includes` (e.g. `*.ts`, `*.tsx`) and set `MatchPerLine: true`.

### 3. Graph Synchronization
- After modifying or creating code files, run `graphify update .` to keep the knowledge graph current (deterministic AST extraction, zero LLM token cost).
