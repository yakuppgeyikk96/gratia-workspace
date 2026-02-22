---
name: smart-commit
description: Analyze all staged and unstaged changes, group them into logical commits by feature/scope, and create well-structured conventional commits.
allowed-tools: Read, Grep, Glob, Bash
---

# Smart Commit

Analyze current changes and create logical, grouped conventional commits.

## Process

1. **Analyze changes**
   - Run `git status` to see all modified, added, and untracked files
   - Run `git diff` (unstaged) and `git diff --cached` (staged) to understand all changes
   - Run `git log --oneline -5` to understand recent commit style

2. **Group changes logically**
   - Group files by feature, module, or scope (e.g., "product API", "vendor dashboard sidebar", "shared types")
   - Each group becomes one commit
   - A single file can only belong to one group
   - Order groups so dependencies come first (e.g., types before implementation, API before frontend)

3. **Determine commit type for each group**
   - `feat:` — New feature or functionality
   - `fix:` — Bug fix
   - `refactor:` — Code restructuring without behavior change
   - `chore:` — Build, config, tooling, dependencies
   - `docs:` — Documentation only
   - `test:` — Adding or updating tests
   - `perf:` — Performance improvement
   - `style:` — Code style/formatting (no logic change)

4. **Present the commit plan**
   - Show each group with: commit type, scope, message, and file list
   - Ask for user confirmation before executing
   - Format:
     ```
     Commit 1: feat(product): add product creation API endpoint
       - apps/gratia-api/src/modules/product/product.constants.ts (new)
       - apps/gratia-api/src/modules/product/product.validations.ts (new)
       - apps/gratia-api/src/modules/product/product.repository.ts (modified)
       ...

     Commit 2: feat(vendor-dashboard): add product creation form
       - apps/gratia-vendor-dashboard/src/types/Product.types.ts (new)
       ...
     ```

5. **Execute commits**
   - For each group, stage only that group's files with `git add <file1> <file2> ...`
   - Create the commit with the conventional message
   - Use HEREDOC format for commit messages:
     ```bash
     git commit -m "$(cat <<'EOF'
     feat(scope): short description

     Optional body with more details.
     EOF
     )"
     ```

## Rules

- **Never** use `git add .` or `git add -A` — always add specific files
- **Never** commit `.env` files, credentials, or secrets
- **Never** amend existing commits unless explicitly asked
- **Never** push to remote unless explicitly asked
- Keep commit messages concise: subject line under 72 characters
- Use imperative mood: "add feature" not "added feature"
- If `$ARGUMENTS` is provided, use it as guidance for grouping or filtering (e.g., "only API changes", "split frontend and backend")
