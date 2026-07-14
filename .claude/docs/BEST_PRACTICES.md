# Best Practices Index

This documentation has been split into framework-specific submodules for better maintainability and reusability across projects.

## Framework-Specific Documentation

| Framework | Submodule | Description |
|-----------|-----------|-------------|
| **NestJS** | [claude-nestjs](https://github.com/potentialInc/claude-nestjs) | Controllers, Services, DTOs, Entities, Error Handling, Database Patterns, Security, curl API Testing, Socket.IO Gateway |
| **React** | [claude-react](https://github.com/potentialInc/claude-react) | Components, State Management (Redux, React Query), Forms (React Hook Form + Zod), Tailwind CSS, Shadcn/UI, Socket.IO Frontend |

## Shared Documentation (This Repo)

| Topic | File | Description |
|-------|------|-------------|
| **E2E Testing** | [E2E_TESTING.md](./E2E_TESTING.md) | Playwright Page Object Model, Test Fixtures |
| **Troubleshooting** | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues and solutions |

## Usage by Project Type

### NestJS + React Web
Use all three submodules:
```
.claude/
├── base/      # This repo (shared)
├── nestjs/    # claude-nestjs
└── react/     # claude-react
```

### NestJS + React Native Mobile
```
.claude/
├── base/      # This repo (shared)
├── nestjs/    # claude-nestjs
└── reactnative/  # Your React Native config
```

### NestJS API Only
```
.claude/
├── base/      # This repo (shared)
└── nestjs/    # claude-nestjs
```

---

**Related Repos**:

- [claude-nestjs](https://github.com/potentialInc/claude-nestjs) - NestJS backend configuration
- [claude-react](https://github.com/potentialInc/claude-react) - React frontend configuration
