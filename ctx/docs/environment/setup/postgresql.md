# PostgreSQL Runtime For Mindstream (`pgvector`)

- Path: `ctx/docs/environment/setup/postgresql.md`
- Template Version: `20260619`
- Changed: `20260619`

---

## 1. Document Scope

This document describes:

- the minimum PostgreSQL requirements;
- the mandatory `pgvector` extension;
- criteria for a correct runtime environment;
- database backup and restore operations.

This document **does not describe**:

- database-schema structure;
- domain tables;
- data migrations;
- storage-layer logic.

---

## 2. PostgreSQL Requirements

The runtime environment is **correct** if all of the following are true:

- PostgreSQL version **16+**;
- one Mindstream project database;
- ability to install extensions (`superuser` or equivalent);
- `pgvector` installed and enabled.

PostgreSQL without `pgvector` support is an **invalid runtime environment**.

---

## 3. Installing The `pgvector` Extension

### 3.1. Check PostgreSQL Version

```sh
psql --version
```

### 3.2. Install The `pgvector` Package (Ubuntu / Debian)

```sh
sudo apt update
sudo apt install postgresql-16-pgvector
```

Replace the package version with the actual one.

### 3.3. Restart PostgreSQL

```sh
sudo systemctl restart postgresql
```

---

## 4. Enable `pgvector` In The Database

### 4.1. Connect To The Mindstream Database

```sh
psql -d mindstream
```

### 4.2. Create The Extension

```sql
CREATE EXTENSION vector;
```

### 4.3. Verify Installation

```sql
SELECT extname FROM pg_extension WHERE extname = 'vector';
```

---

## 5. Verify Vector-Type Support

```sql
SELECT '[1,2,3]'::vector;
```

---

## 6. Use In Mindstream

After PostgreSQL is prepared, run:

```text
db:schema:renew
process:generate:embeddings
```

Embeddings are stored in columns of type `vector(N)`.

---

## 7. Invariants And Constraints

- `pgvector` is a **mandatory dependency** of the storage layer;
- embeddings must not be stored in JSON, arrays, or text fields;
- environments without `pgvector` are unsupported;
- in production, the extension must be installed **before application startup**.

---

## 8. Database Backup

```sh
sudo -u postgres pg_dump \
  --format=custom \
  --clean \
  --if-exists \
  mindstream \
  | gzip > mindstream_$(date +%Y%m%d_%H%M%S).dump.gz
```

---

## 9. Database Restore

```sh
gunzip -c mindstream_YYYYMMDD_HHMMSS.dump.gz \
  | sudo -u postgres pg_restore \
      --clean \
      --if-exists \
      --role=mindstream \
      --dbname=mindstream
```

Verification:

```sh
psql -U mindstream -d mindstream -c '\dt'
```

All database objects must belong to the `mindstream` user.

---

## 10. Environment Correctness Criterion

The PostgreSQL environment is **correctly prepared** if:

- PostgreSQL 16+ is running;
- the `pgvector` extension is installed and enabled;
- the `vector` type is available;
- `db:schema:renew` and `process:generate:embeddings` run without errors;
- all `mindstream` database objects belong to the `mindstream` user.

---
