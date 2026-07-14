---
description: Initialize Claude Code configuration (.claude submodule) for a project
argument-hint: Optional project name (will prompt if not provided)
---

You are a project initialization assistant. Your task is to set up a new project with the modular `.claude` submodule architecture.

## Step 0: Gather Project Information

### Get Project Name

If $ARGUMENTS is provided, use it as the project name. Otherwise, ask the user:

```
What is the project name? (e.g., myapp, coaching-platform)
This will be used for the config repo: <project-name>-claude
```

Store the result as `$PROJECT_NAME` (lowercase, hyphenated).

### Get Tech Stack

Use **AskUserQuestion** to ask the user for their tech stack:

**Backend Framework:**
1. **NestJS** (Recommended for TypeScript) - TypeORM, JWT, Swagger
2. **Django** - Django REST Framework, SimpleJWT, drf-spectacular

**Frontend Framework(s)** (can select multiple):
1. **React Web** - React 19, TailwindCSS 4, shadcn/ui
2. **React Native** - NativeWind, React Navigation, Detox

Store selections as:
- `$BACKEND` = "nestjs" | "django"
- `$FRONTEND` = array of ["react", "react-native"]

## Step 1: Create Project-Specific Claude Config Repo

```bash
# Create the config repo on GitHub
gh repo create potentialInc/$PROJECT_NAME-claude --public --description "Claude Code configuration for $PROJECT_NAME"

# Clone it locally
git clone https://github.com/potentialInc/$PROJECT_NAME-claude.git /tmp/$PROJECT_NAME-claude
cd /tmp/$PROJECT_NAME-claude
```

## Step 2: Add Framework Submodules

```bash
cd /tmp/$PROJECT_NAME-claude

# Always add base (shared agents, hooks, commands)
git submodule add https://github.com/potentialInc/claude-base.git base
```

Based on user selection, add backend submodule:

**For NestJS:**
```bash
git submodule add https://github.com/potentialInc/claude-nestjs.git nestjs
```

**For Django:**
```bash
git submodule add https://github.com/potentialInc/claude-django.git django
```

Based on user selection, add frontend submodule(s):

**For React Web:**
```bash
git submodule add https://github.com/potentialInc/claude-react.git react
```

**For React Native:**
```bash
git submodule add https://github.com/potentialInc/claude-react-native.git react-native
```

Then initialize nested submodules:
```bash
git submodule update --init --recursive
```

## Step 3: Create Project-Specific Structure

```bash
cd /tmp/$PROJECT_NAME-claude

# Create directories for project-specific overrides
mkdir -p agents hooks skills

# Create symlink to base commands
ln -s base/commands commands

# Create .gitignore
cat > .gitignore << 'EOF'
settings.local.json
*.local.*
EOF
```

## Step 4: Create settings.json

Create settings.json with hooks pointing to the appropriate framework:

```bash
cat > settings.json << 'EOF'
{
  "hooks": {
    "UserPromptSubmit": [],
    "PostToolUse": [],
    "Stop": []
  },
  "mcpServers": {}
}
EOF
```

## Step 5: Create skill-rules.json

Generate skill-rules.json based on the selected frameworks:

```bash
cat > skills/skill-rules.json << 'EOF'
{
  "version": "1.0",
  "skills": {
    "backend-dev-guidelines": {
      "type": "domain",
      "enforcement": "suggest",
      "priority": "high",
      "promptTriggers": {
        "keywords": ["api", "backend", "controller", "service", "entity", "repository"]
      }
    },
    "frontend-dev-guidelines": {
      "type": "domain",
      "enforcement": "suggest",
      "priority": "high",
      "promptTriggers": {
        "keywords": ["react", "component", "frontend", "ui", "tsx", "page"]
      }
    }
  }
}
EOF
```

## Step 6: Commit and Push Config Repo

Construct commit message based on selected frameworks:

```bash
cd /tmp/$PROJECT_NAME-claude
git add -A
git commit -m "$(cat <<'EOF'
feat: Initialize Claude Code config with modular submodules

- base/ submodule for shared agents, hooks, commands
- $BACKEND/ submodule for backend patterns
- $FRONTEND/ submodule(s) for frontend patterns

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"

git push -u origin main
```

## Step 7: Add to Main Project (Optional)

Ask the user if they want to add the config repo to their main project:

**Options:**
1. **Yes, add as submodule now** - Add .claude submodule to current project
2. **No, I'll do it later** - Just report the repo URL

**If user selects "Yes":**

```bash
cd $CLAUDE_PROJECT_DIR

# Remove any existing .claude directory (if exists)
rm -rf .claude 2>/dev/null || true

# Add .claude as a submodule pointing to the config repo
git submodule add https://github.com/potentialInc/$PROJECT_NAME-claude.git .claude

# Initialize all nested submodules
git submodule update --init --recursive

# Commit
git add .gitmodules .claude
git commit -m "$(cat <<'EOF'
feat: Add .claude submodule for Claude Code configuration

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

## Step 8: Report Results

```
✓ Created project-specific Claude config repo:
  https://github.com/potentialInc/$PROJECT_NAME-claude

Configuration:
- Base: claude-base (shared agents, hooks, commands)
- Backend: claude-$BACKEND ($BACKEND patterns)
- Frontend: claude-$FRONTEND ($FRONTEND patterns)

Structure:
.claude/
├── base/           → claude-base
├── $BACKEND/       → claude-$BACKEND
├── $FRONTEND/      → claude-$FRONTEND
├── agents/         (project-specific)
├── hooks/          (project-specific)
├── skills/         (skill-rules.json)
├── commands        → base/commands
└── settings.json

Next steps:
1. Clone with submodules: git clone --recurse-submodules <your-project-url>
2. Or if already cloned: git submodule update --init --recursive
```

## Error Handling

- If repo creation fails: Check gh auth status and permissions
- If submodule add fails: Ensure the framework repos exist
- If push fails: Check if main branch exists
- If user cancels: Stop gracefully and report what was created

## Available Framework Repos

| Repo | URL |
|------|-----|
| claude-base | https://github.com/potentialInc/claude-base |
| claude-nestjs | https://github.com/potentialInc/claude-nestjs |
| claude-django | https://github.com/potentialInc/claude-django |
| claude-react | https://github.com/potentialInc/claude-react |
| claude-react-native | https://github.com/potentialInc/claude-react-native |
