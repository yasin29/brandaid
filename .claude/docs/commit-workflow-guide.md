# Claude Commit Workflow Guide

This guide explains how to use Claude to commit code and create pull requests in our monorepo setup.

---

## Quick Start

Simply tell Claude:

```
/commit
```

or

```
Please commit my changes
```

Claude will handle everything automatically - detecting changes, creating branches, committing, and creating PRs.

---

## How It Works

### The Workflow

1. **You make code changes** in any project folder
2. **Run `/commit`** or ask Claude to commit
3. **Claude asks for your branch prefix** (e.g., your name: `john`, `sarah`, `alex`)
4. **Claude detects all changed projects** and shows you a summary
5. **You choose** separate PRs per project or one combined PR
6. **Claude creates feature branches, commits, and PRs** targeting the `dev` branch
7. **You receive PR URLs** to review and share with your team

### Branch Naming Convention

All branches follow this pattern:
```
<your-prefix>/<project>-<feature-description>
```

Examples:
- `john/admin-user-management`
- `sarah/backend-auth-fix`
- `alex/mobile-navigation`

---

## Commands & Phrases

### Basic Commands

| What to Say | What Happens |
|-------------|--------------|
| `/commit` | Start the commit workflow |
| `commit my changes` | Same as above |
| `create a PR for my changes` | Same as above |
| `/commit fix login bug` | Commit with custom message "fix login bug" |

### With Custom Commit Messages

```
/commit feat: Add user dashboard
```

```
Please commit with message "fix: Resolve authentication timeout"
```

---

## Step-by-Step Example

### 1. Make Your Changes

Edit files in any project folder:
- `frontend-admin-dashboard/`
- `backend/`
- `mobile/`
- etc.

### 2. Start the Commit Workflow

Type:
```
/commit
```

### 3. Provide Your Branch Prefix

Claude will ask:
```
What is your branch name prefix? (e.g., your name or username)
```

Options might include:
- `john` (Recommended if you're John)
- `sarah`
- `alex`
- Other (type your own)

### 4. Choose PR Strategy

If you have changes in multiple projects, Claude will ask:

```
Projects with changes detected:
1. frontend-admin-dashboard/ (8 files)
2. backend/ (3 files)

How would you like to create PRs?
```

Options:
- **Separate PRs per project** (Recommended) - Each project gets its own PR
- **Combined PR** - All changes in one PR

### 5. Review the Results

Claude will show you:
```
Workflow Complete

PR(s) Created:

1. https://github.com/org/repo/pull/42
   - Branch: john/admin-user-management
   - Commit: abc1234 - feat(admin): Add user management
   - Files: 8 in frontend-admin-dashboard/

2. https://github.com/org/repo/pull/43
   - Branch: john/backend-auth-fix
   - Commit: def5678 - fix(backend): Resolve auth issue
   - Files: 3 in backend/
```

### 6. Share PR Links

Copy the PR URLs and share with your team for code review.

---

## Submodule Handling

Our project uses nested submodules:

```
project/                    (Parent repo)
├── .claude/                (Submodule)
│   ├── base/               (Nested submodule)
│   ├── nestjs/             (Nested submodule)
│   ├── react/              (Nested submodule)
│   └── django/             (Nested submodule)
```

### What Claude Does Automatically

1. **Detects submodule changes** - If you modified files in `.claude/base/` or other submodules
2. **Commits deepest first** - Starts with nested submodules, then `.claude`, then parent
3. **Creates PRs for each level** - Every repo gets its own feature branch and PR
4. **Updates references** - Parent repos automatically reference the new submodule commits

### Example with Submodule Changes

If you edited files in `.claude/base/`:

```
PRs Created:

1. https://github.com/org/claude-base/pull/15
   - Branch: john/base-update-commands
   - Submodule: claude-base

2. https://github.com/org/project-claude/pull/8
   - Branch: john/claude-submodule-refs
   - Submodule: .claude

3. https://github.com/org/project/pull/42
   - Branch: john/admin-feature
   - Parent repo
```

---

## Important Rules

### Always Remember

- **All changes go through PRs** - No direct pushes to `main` or `dev`
- **PRs target `dev` branch** - Not `main`
- **One PR per project folder** (or combined if you choose)
- **Workflow stops if PR creation fails** - Check GitHub access if this happens

### What NOT to Commit

Claude automatically excludes:
- `.env` files (secrets)
- `credentials.json` (sensitive data)
- `node_modules/` (dependencies)
- `dist/`, `build/` (build artifacts)
- `playwright-report/`, `test-results/` (test output)

---

## Troubleshooting

### "PR creation failed"

1. Check GitHub authentication:
   ```bash
   gh auth status
   ```

2. If not logged in:
   ```bash
   gh auth login
   ```

### "Branch already exists"

Claude will ask if you want to:
- Delete and recreate the branch
- Use a different branch name

### "No changes detected"

Make sure you:
1. Saved all your files
2. Are in the correct project directory
3. Haven't already committed the changes

### "Submodule in detached HEAD"

Claude automatically fixes this by:
1. Checking out the `dev` branch
2. Pulling latest changes
3. Continuing with the workflow

---

## Commit Message Format

Claude generates commit messages following this format:

```
<type>(<scope>): <description>

<optional body>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code refactoring |
| `docs` | Documentation |
| `test` | Tests |
| `chore` | Maintenance |
| `style` | Formatting only |

### Scopes

| Scope | Project Folder |
|-------|----------------|
| `admin` | frontend-admin-dashboard |
| `coach` | frontend-coach-dashboard |
| `mobile` | mobile / frontend-mobile |
| `backend` | backend |
| `docs` | .claude-project |
| `dashboard` | frontend-dashboard |

### Examples

```
feat(admin): Add user management API integration
fix(backend): Resolve authentication token expiry
refactor(mobile): Simplify navigation logic
docs: Update API integration plan
```

---

## FAQ

**Q: Can I commit to `main` directly?**
A: No. All changes must go through PRs targeting `dev`.

**Q: What if I only want to commit, not create a PR?**
A: This is not supported. PRs are mandatory for code review.

**Q: Can I use my own commit message?**
A: Yes! Add it after `/commit`: `/commit your message here`

**Q: What happens to my changes after the PR is merged?**
A: Delete your feature branch to keep the repo clean.

**Q: Do I need to handle submodules manually?**
A: No. Claude detects and handles all submodule changes automatically.

---

## Summary

1. Make changes to your code
2. Run `/commit`
3. Provide your branch prefix (e.g., your name)
4. Choose separate or combined PRs
5. Get PR URLs and share with team
6. Review and merge PRs
7. Delete feature branches after merge
