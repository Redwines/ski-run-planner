# API Specification

> Ski Run Planner — API Endpoints and Contracts

---

## Table of Contents

1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Endpoints](#endpoints)
7. [Webhooks](#webhooks)

---

## Overview

<!-- API design philosophy and conventions -->

- REST / GraphQL
- JSON request/response bodies
- ISO 8601 date formats

---

## Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3000/api` |
| Staging | |
| Production | |

---

## Authentication

### Method

<!-- JWT, API Key, OAuth, etc. -->

### Headers

```
Authorization: Bearer <token>
```

### Token Lifecycle

| Action | Endpoint | Notes |
|--------|----------|-------|
| Obtain | | |
| Refresh | | |
| Revoke | | |

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | |
| `FORBIDDEN` | 403 | |
| `NOT_FOUND` | 404 | |
| `VALIDATION_ERROR` | 422 | |
| `INTERNAL_ERROR` | 500 | |

---

## Rate Limiting

| Tier | Limit | Window |
|------|-------|--------|
| Anonymous | | |
| Authenticated | | |
| Premium | | |

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1234567890
```

---

## Endpoints

### [Resource Name]

#### List [Resources]

```
GET /api/[resources]
```

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | integer | No | Page number |
| `limit` | integer | No | Items per page |

**Response:**

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

#### Get [Resource]

```
GET /api/[resources]/:id
```

**Response:**

```json
{
  "data": {
    "id": "",
    "createdAt": "",
    "updatedAt": ""
  }
}
```

#### Create [Resource]

```
POST /api/[resources]
```

**Request Body:**

```json
{

}
```

**Response:** `201 Created`

```json
{
  "data": {
    "id": ""
  }
}
```

#### Update [Resource]

```
PATCH /api/[resources]/:id
```

**Request Body:**

```json
{

}
```

**Response:** `200 OK`

#### Delete [Resource]

```
DELETE /api/[resources]/:id
```

**Response:** `204 No Content`

---

### [Resource Name 2]

<!-- Repeat endpoint structure -->

---

## Webhooks

### Events

| Event | Trigger | Payload |
|-------|---------|---------|
| | | |

### Payload Format

```json
{
  "event": "event.name",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {}
}
```

### Verification

<!-- How to verify webhook signatures -->

---

*Last Updated: YYYY-MM-DD*
