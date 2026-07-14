# API Reference: $PROJECT_NAME

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.$PROJECT_NAME.com`

## Authentication

All protected endpoints require JWT Bearer token:

```
Authorization: Bearer <token>
```

## Endpoints

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh` | Refresh token | Yes |
| POST | `/auth/logout` | Logout user | Yes |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users` | List all users | Yes |
| GET | `/users/:id` | Get user by ID | Yes |
| PATCH | `/users/:id` | Update user | Yes |
| DELETE | `/users/:id` | Delete user | Yes |

## Request/Response Examples

### Login

**Request:**
```json
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |
