---
description: Pull latest changes from remote for parent repo and all submodules
argument-hint: Optional branch name for parent repo (default: dev)
---

You are a git workflow assistant. Your task is to pull the latest changes from remote for both the parent repository and all git submodules.

## Submodule Architecture

This project uses nested submodules:

```
project/                    # Parent repo (dev branch by default)
├── .claude/                # Submodule → project-claude repo (main branch)
│   ├── base/               # Submodule → claude-base (main branch)
│   ├── <tech-stack>/       # Submodules → claude-nestjs, claude-react, etc. (main branch)
│   └── commands -> base/commands
```

**Branch Policy:**
- **Parent repo:** `dev` branch (default for development)
- **All submodules:** `main` branch (always)

**Important:** Update submodules in order from deepest to shallowest.

---

## Step 0.5: Verify Submodule Health (CRITICAL)

Before pulling, ensure submodules are on the correct branches. This prevents issues when feature branches have inherited stale submodule references.

### 0.5.1 Check if .claude is a submodule

```bash
if [ -f ".claude/.git" ]; then
  echo "✓ .claude is a submodule"
else
  echo "ℹ️ .claude is not a submodule, skipping health check"
  # Skip to Step 1
fi
```

### 0.5.2 Check and fix .claude submodule branch

```bash
cd .claude
CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then
  echo "⚠️ .claude submodule is in detached HEAD, will switch to main during pull"
elif [ "$CURRENT_BRANCH" != "main" ]; then
  echo "⚠️ .claude submodule is on '$CURRENT_BRANCH', will switch to main during pull"
else
  echo "✓ .claude is on main branch"
fi
cd ..
```

### 0.5.3 Check nested submodule branches

```bash
cd .claude
for dir in base nestjs react django; do
  if [ -d "$dir" ] && [ -e "$dir/.git" ]; then
    cd "$dir"
    NESTED_BRANCH=$(git branch --show-current)
    if [ -z "$NESTED_BRANCH" ]; then
      echo "⚠️ .claude/$dir is in detached HEAD, will switch to main during pull"
    elif [ "$NESTED_BRANCH" != "main" ]; then
      echo "⚠️ .claude/$dir is on '$NESTED_BRANCH', will switch to main during pull"
    else
      echo "✓ .claude/$dir is on main branch"
    fi
    cd ..
  fi
done
cd ..
```

**Why this matters:** Feature branches may have inherited incorrect submodule references. This check identifies issues before pulling.

---

## Step 1: Check Git Status

First, check the current state of the repository:

```bash
git status
```

Review the output:
- If there are uncommitted changes (staged or unstaged), warn the user that pulling may cause conflicts
- If the working directory is clean, proceed to the next step

---

## Step 2: Determine Parent Branch

If $ARGUMENTS is provided, use it as the branch name.

If $ARGUMENTS is NOT provided, **default to `dev` branch** (do not ask, just use `dev`).

The user can override by running `/pull main` if they need to pull from main.

---

## Step 3: Pull Parent Repository

First, checkout and pull the determined branch (default: `dev`):

```bash
git checkout dev
git pull origin dev
```

Or if a different branch was specified:
```bash
git checkout <branch>
git pull origin <branch>
```

Handle potential issues:
- If there are merge conflicts, inform the user and stop
- If the pull was successful, report what was updated

---

## Step 4: Initialize and Update Submodules

First, ensure all submodules are initialized:

```bash
git submodule init
git submodule update --init --recursive
```

This syncs submodules to the commits recorded in the parent repo.

---

## Step 5: Pull Latest in Nested Submodules (Deepest First)

**IMPORTANT:** Update submodules from deepest to shallowest to avoid conflicts.

### 5.1 Discover and Update All Nested Submodules

Dynamically find and update all submodules inside `.claude`:

```bash
# Find all subdirectories in .claude that are git repos (submodules)
cd .claude
for submodule in */; do
  submodule_name="${submodule%/}"

  # Skip if not a git submodule (check for .git file or directory)
  if [ ! -e "$submodule_name/.git" ]; then
    continue
  fi

  # Skip symlinks (like commands)
  if [ -L "$submodule_name" ]; then
    continue
  fi

  echo "Updating .claude/$submodule_name..."
  cd "$submodule_name"
  git checkout main
  git pull origin main
  cd ..
done
cd ..
```

This handles any nested submodules including:
- `base` (always present)
- `nestjs` (if NestJS project)
- `django` (if Django project)
- `react` (if React project)
- `react-native` (if React Native project)

### 5.2 Update .claude Submodule

After nested submodules are updated, update `.claude` itself:

```bash
cd .claude
git checkout main
git pull origin main
cd ..
```

**Note:** If `.claude` pull fails with "Entry would be overwritten by merge", it means a nested submodule has local changes. Resolve by:
1. Stashing or committing changes in the nested submodule
2. Or running `git submodule update --init --recursive --force` (loses local changes)

---

## Step 6: Check for Submodule Reference Updates

After pulling, check if the parent repo needs to record new submodule commits:

```bash
git status
```

If `.claude` shows as modified (new commits), inform the user:

```
Note: Submodules were updated. If you want to record these updates in the parent repo,
run `/commit` to create a commit with the updated submodule references.
```

---

## Step 7: Sync Commands from Submodules

After pulling submodule updates, verify commands are properly linked:

```bash
# Check if commands symlink exists and points to base/commands
if [ -L .claude/commands ]; then
  echo "Commands symlink OK: $(readlink .claude/commands)"
else
  echo "Warning: .claude/commands is not a symlink"
  # Recreate symlink if needed
  rm -rf .claude/commands
  ln -s base/commands .claude/commands
  echo "Recreated commands symlink"
fi
```

---

## Step 8: Report Results

After completion, report:

```
✓ Pull Complete

Parent repo:
  - Branch: <branch>
  - Status: <updated/already up to date>

Submodules updated:
  - .claude/base: <commit> (main)
  - .claude/<other>: <commit> (main)
  - .claude: <commit> (main)

Commands: <symlink status>

Any issues: <warnings if any>
```

---

## Error Handling

| Issue | Resolution |
|-------|------------|
| Working directory is dirty | Warn user, continue (let git handle conflicts) |
| Pull fails due to conflicts | STOP, inform user how to resolve |
| Submodule update fails | Report which submodule failed and why |
| "Entry would be overwritten" | Nested submodule has uncommitted changes - stash or commit first |
| No submodules exist | Skip submodule steps silently |
| Commands symlink broken | Recreate symlink to base/commands |

---

## Quick Reference

Pull order (deepest first):
1. `.claude/<all-nested-submodules>` → main (base, nestjs, django, react, react-native, etc.)
2. `.claude` → main
3. Parent repo → `dev` (default) or user-specified branch
