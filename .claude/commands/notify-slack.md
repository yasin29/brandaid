---
description: Send PR statistics and Slack activity report to a Slack channel via webhook
argument-hint: Optional - Slack webhook URL (uses SLACK_WEBHOOK_URL env var if not provided)
---

# Notify Slack Command

Collects PR statistics from GitHub repositories and Slack channel activity, then sends a combined report to Slack via webhook.

---

## Overview

```
/notify-slack
        |
        v
1. Collect GitHub PR stats (4 repos)
        |
        v
2. Query Slack channel for "today's winning" messages (via Slack API)
        |
        v
3. Format and send report to Slack webhook
```

---

## Prerequisites Check

Before starting, verify required tools:

```bash
# Check gh CLI authentication
gh auth status

# Check curl availability
which curl
```

If `gh auth status` fails, instruct user to run `gh auth login` and **STOP**.

---

## Configuration

### Environment Variables Required

| Variable | Required | Description |
|----------|----------|-------------|
| `SLACK_BOT_TOKEN` | Yes | Slack Bot Token (xoxb-...) for reading messages |
| `SLACK_WEBHOOK_URL` | Yes* | Webhook URL for sending notifications |

*Can also be provided as `$ARGUMENTS`

### Slack Bot Token Setup

The bot token requires these OAuth scopes:
- `channels:history` - Read messages from public channels
- `channels:read` - List channels to find channel ID
- `users:read` - Get user display names

To create a Slack Bot Token:
1. Go to https://api.slack.com/apps
2. Create a new app or select existing
3. Go to "OAuth & Permissions"
4. Add the required scopes
5. Install to workspace
6. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

### Target Repositories
- `potentialInc/claude-base`
- `potentialInc/claude-nestjs`
- `potentialInc/claude-react`
- `potentialInc/claude-django`

### Slack Configuration
- **Query Channel**: `ai-workflow`
- **Message Filter**: Messages containing "today's winning" (case-insensitive)

### Get Required Credentials

Check for credentials in environment:

```bash
# Check SLACK_BOT_TOKEN
if [ -z "$SLACK_BOT_TOKEN" ]; then
  echo "SLACK_BOT_TOKEN not set"
fi

# Check SLACK_WEBHOOK_URL (or use $ARGUMENTS)
WEBHOOK_URL="${ARGUMENTS:-$SLACK_WEBHOOK_URL}"
if [ -z "$WEBHOOK_URL" ]; then
  echo "SLACK_WEBHOOK_URL not set"
fi
```

If `SLACK_BOT_TOKEN` is not set, use **AskUserQuestion** to ask:
```
Please provide your Slack Bot Token (xoxb-...):
```

If `WEBHOOK_URL` is not available, use **AskUserQuestion** to ask:
```
Please provide the Slack webhook URL for sending notifications:
Example: https://hooks.slack.com/services/XXX/YYY/ZZZ
```

---

## Step 1: Collect GitHub PR Statistics

For EACH repository, collect PR data using `gh` CLI.

### 1.1 Fetch Open PRs

```bash
# For each repo
gh pr list --repo potentialInc/claude-base --state open --json number,title,author,createdAt,updatedAt
gh pr list --repo potentialInc/claude-nestjs --state open --json number,title,author,createdAt,updatedAt
gh pr list --repo potentialInc/claude-react --state open --json number,title,author,createdAt,updatedAt
gh pr list --repo potentialInc/claude-django --state open --json number,title,author,createdAt,updatedAt
```

### 1.2 Extract Metrics Per Repository

For each repository, calculate:

| Metric | Description | Calculation |
|--------|-------------|-------------|
| Open Count | Total open PRs | `jq 'length'` |
| Authors | Unique PR authors (display names) | `jq '[.[].author.name] \| unique'` |
| Oldest Age | Days since oldest PR created | Calculate from `createdAt` |
| Recent Activity | PRs updated in last 7 days | Filter by `updatedAt` |

### 1.3 Build Summary Object

Create a summary structure:

```json
{
  "github": {
    "repos": [
      {
        "name": "claude-base",
        "openCount": 3,
        "authors": ["alice", "bob"],
        "oldestDays": 12,
        "recentActivity": 2
      }
    ],
    "totalOpen": 11,
    "totalRepos": 4
  }
}
```

### 1.4 Handle Errors

If a repository is not found or inaccessible:
- Log a warning: `Warning: Could not access potentialInc/<repo>`
- Continue with other repositories
- Include error note in final report

---

## Step 2: Query Slack Channel Activity

Use the Slack Web API to query messages from the `ai-workflow` channel.

### 2.1 Get Channel ID

First, find the channel ID for `ai-workflow`:

```bash
curl -s -X GET "https://slack.com/api/conversations.list?types=public_channel&limit=1000" \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" | jq -r '.channels[] | select(.name=="ai-workflow") | .id'
```

Store the result as `$CHANNEL_ID`.

If channel not found, try with `exclude_archived=false`:
```bash
curl -s -X GET "https://slack.com/api/conversations.list?types=public_channel&limit=1000&exclude_archived=false" \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN"
```

### 2.2 Fetch Channel Messages

Query messages from the channel (last 100 messages or specify time range):

```bash
# Get messages from the last 7 days
OLDEST=$(date -v-7d +%s 2>/dev/null || date -d '7 days ago' +%s)

curl -s -X GET "https://slack.com/api/conversations.history?channel=$CHANNEL_ID&oldest=$OLDEST&limit=100" \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json"
```

### 2.3 Filter "Today's Winning" Messages

From the API response, filter messages that contain "today's winning" (case-insensitive):

```bash
# Using jq to filter messages
jq '[.messages[] | select(.text | ascii_downcase | contains("today'\''s winning"))]'
```

### 2.4 Get User Display Names and IDs

For each unique user ID in the filtered messages, get their display name:

```bash
curl -s -X GET "https://slack.com/api/users.info?user=$USER_ID" \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" | jq -r '{id: .user.id, name: .user.real_name // .user.name}'
```

### 2.5 Match GitHub Authors to Slack Users

To enable Slack mentions, match GitHub author names to Slack user IDs:

```bash
# Get all Slack users
curl -s "https://slack.com/api/users.list" \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" | jq '.members[] | select(.deleted == false) | {id, real_name}'

# Match by similar name (case-insensitive)
# GitHub: "Talha Mahmud" -> Search Slack for "talha" -> ID: U08CY4947U2
# Use fuzzy matching on first name or full name
```

For mentioning users in the report, use format: `<@USER_ID>`
- Example: `<@U08CY4947U2>` will show as @talha in Slack

### 2.6 Build Slack Summary

Extract and structure the data:

```json
{
  "slack": {
    "channel": "ai-workflow",
    "filter": "today's winning",
    "messageCount": 5,
    "authors": ["John Doe", "Jane Smith", "Bob Wilson"],
    "latestMessage": {
      "timestamp": "2025-01-13T09:30:00Z",
      "author": "John Doe",
      "excerpt": "today's winning feature: improved..."
    },
    "messages": [
      {
        "author": "John Doe",
        "timestamp": "2025-01-13T09:30:00Z",
        "excerpt": "today's winning feature: improved..."
      }
    ]
  }
}
```

### 2.7 Handle Slack Errors

| Error Response | Cause | Action |
|----------------|-------|--------|
| `channel_not_found` | Channel doesn't exist or bot not in channel | Report 0 messages, note error |
| `not_in_channel` | Bot needs to be added to channel | Instruct user to add bot |
| `invalid_auth` | Token expired or invalid | Ask for new token |
| `missing_scope` | Token lacks required permissions | List required scopes |

If Slack query fails:
- Log: `Warning: Could not query Slack channel ai-workflow`
- Set `messageCount` to 0
- Include error note in final report

---

## Step 3: Format Report

Create a Slack Block Kit formatted message **grouped by person**.

### 3.1 Data Aggregation

Combine GitHub PR authors and Slack message authors into a unified list of people. For each person, aggregate:
- Their open PRs (count + details)
- Their "Today's Winning" messages (count + summaries)

### 3.2 Message Structure (Per Person)

```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "Daily Activity Report (By Person)"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Person Name*"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*PR Count:* 2\n• `claude-react` #1: feat: Add new component\n• `claude-nestjs` #5: fix: Auth bug"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Today's Winning:* 1\n• Created feature X - brief summary of the winning"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "Generated: 2025-01-13 10:00 AM UTC"
        }
      ]
    }
  ]
}
```

### 3.3 Simple Text Fallback

```
*Daily Activity Report (By Person)*

---

*Talha Mahmud*
- PR Count: 1
  • `claude-react` #1: docs: Update common and component patterns guides
- Today's Winning: 0

---

*Lukas*
- PR Count: 0
- Today's Winning: 1
  • Created `generate-ppt` command - converts natural language to Presentation

---
Generated: 2025-01-13 10:00 AM UTC
```

---

## Step 4: Send to Slack

### 4.1 POST to Webhook

```bash
curl -X POST "$WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -d "$PAYLOAD"
```

Use a HEREDOC for the payload to ensure proper formatting:

```bash
curl -X POST "$WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -d "$(cat <<'EOF'
{
  "blocks": [...]
}
EOF
)"
```

### 4.2 Check Response

- **Success (200)**: Continue to report
- **Failure (4xx/5xx)**: Report error and suggest checking webhook URL

---

## Step 5: Report Results

### Success Report

```
Notification sent successfully!

Summary:
- Repositories checked: 4
- Total open PRs: 11
- Slack messages found: 5
- Webhook response: 200 OK

Report delivered to Slack webhook.
```

### Partial Success Report

```
Notification sent with warnings.

Summary:
- Repositories checked: 3/4 (claude-django not accessible)
- Total open PRs: 10
- Slack messages: Could not query (API error)
- Webhook response: 200 OK

Warnings:
- Could not access potentialInc/claude-django
- Slack API error: [error message]
```

### Failure Report

```
Notification failed.

Error: Webhook POST failed
Response: 404 Not Found

Action Required: Verify your Slack webhook URL is correct.
```

---

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `gh auth` fails | Not authenticated | Run `gh auth login` |
| Repository not found | Wrong name or no access | Skip with warning |
| `invalid_auth` | Slack token invalid | Check/regenerate bot token |
| `missing_scope` | Token lacks permissions | Add required OAuth scopes |
| `channel_not_found` | Channel doesn't exist | Verify channel name |
| `not_in_channel` | Bot not added to channel | Add bot to ai-workflow |
| Webhook POST fails | Invalid URL | Check webhook URL |
| Webhook 404/403 | URL expired or wrong | Regenerate webhook |

---

## Example Usage

### Using environment variables:
```bash
export SLACK_BOT_TOKEN="xoxb-your-bot-token"
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/XXX/YYY/ZZZ"
/notify-slack
```

### Providing webhook URL directly:
```bash
export SLACK_BOT_TOKEN="xoxb-your-bot-token"
/notify-slack "https://hooks.slack.com/services/XXX/YYY/ZZZ"
```

---

## Important Notes

- **Token security**: Never log or display the bot token or webhook URL in output
- **Rate limits**: Slack API has rate limits; single channel query should not hit limits
- **GitHub rate limits**: 4 repos with single calls should not hit limits
- **Case insensitive**: "today's winning" filter matches messages containing "Today's Winning", "TODAY'S WINNING", etc. anywhere in the text
- **Bot channel access**: The Slack bot must be added to `ai-workflow` channel to read messages
- **Report timestamp**: Always include generation timestamp in UTC
