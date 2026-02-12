# Data Model

> Ski Run Planner — Database Schema and Entity Relationships

---

## Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Entities](#entities)
4. [Enums](#enums)
5. [Indexes](#indexes)
6. [Migrations](#migrations)

---

## Overview

<!-- Database choice, ORM, naming conventions -->

- **Database:**
- **ORM:**
- **Naming:** snake_case for DB, camelCase for code

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                    [ER Diagram]                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Entities

### Entity: [Name]

**Description:**
**Table:** `table_name`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | gen_random_uuid() | Primary key |
| `created_at` | TIMESTAMP | No | now() | |
| `updated_at` | TIMESTAMP | No | now() | |
| | | | | |

**Relationships:**

| Relation | Type | Target | Foreign Key |
|----------|------|--------|-------------|
| | 1:N / N:1 / N:N | | |

**Constraints:**

-
-

---

### Entity: [Name]

**Description:**
**Table:** `table_name`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | gen_random_uuid() | Primary key |
| `created_at` | TIMESTAMP | No | now() | |
| `updated_at` | TIMESTAMP | No | now() | |
| | | | | |

**Relationships:**

| Relation | Type | Target | Foreign Key |
|----------|------|--------|-------------|
| | | | |

---

### Entity: [Name]

**Description:**
**Table:** `table_name`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | gen_random_uuid() | Primary key |
| `created_at` | TIMESTAMP | No | now() | |
| `updated_at` | TIMESTAMP | No | now() | |
| | | | | |

**Relationships:**

| Relation | Type | Target | Foreign Key |
|----------|------|--------|-------------|
| | | | |

---

## Enums

### [Enum Name]

**Used by:** `table.column`

| Value | Description |
|-------|-------------|
| | |

### [Enum Name]

**Used by:** `table.column`

| Value | Description |
|-------|-------------|
| | |

---

## Indexes

| Table | Index Name | Columns | Type | Purpose |
|-------|------------|---------|------|---------|
| | | | BTREE/GIN/etc | |

---

## Migrations

### Migration Strategy

<!-- How migrations are handled -->

### Migration Log

| Version | Description | Date | Status |
|---------|-------------|------|--------|
| 001 | Initial schema | | Pending |
| | | | |

---

*Last Updated: YYYY-MM-DD*
