# Project Knowledge: $PROJECT_NAME

## Overview

[Brief description of what this project does]

## Tech Stack

- **Backend**: $BACKEND
- **Frontend**: $FRONTENDS
- **Database**: [PostgreSQL/MySQL/etc.]
- **Deployment**: [Docker/Kubernetes/etc.]

## Architecture

```
$PROJECT_NAME/
├── backend/           # API server
├── frontend/          # Web application
├── frontend-dashboard/ # Admin dashboard (if applicable)
├── mobile/            # Mobile app (if applicable)
└── docker-compose.yml
```

## Key Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| [Decision 1] | [Why this choice was made] | YYYY-MM-DD |

## Development Setup

```bash
# Clone with submodules
git clone --recurse-submodules <repo-url>

# Start services
docker-compose up -d
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |

## External Services

| Service | Purpose | Documentation |
|---------|---------|---------------|
| [Service 1] | [What it's used for] | [Link] |
