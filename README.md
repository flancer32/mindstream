# Mindstream — MVP персональной смысловой ленты

Этот репозиторий — приложение из статьи на Хабре «От идей к коду: проверяю теорию внимания на практике».
Ссылка: <https://habr.com/ru/articles/995070/>

Ссылка на работающую версию: <https://mindstream.app.wiredgeese.com/>

Mindstream — персональный инструмент чтения и ориентации в потоке публикаций.
Он агрегирует корпус публикаций, формирует аннотацию и обзор и строит персональную ленту как локальную проекцию корпуса с учётом внимания пользователя и агрегированной статистики.
Mindstream не является рекомендательным сервисом и не управляет вниманием пользователя.

## Ключевые идеи MVP

- Один общий корпус публикаций для всех пользователей.
- Лента формируется в браузере как персональная проекция корпуса.
- Смысловые представления публикации: аннотация и обзор.
- Сигналы внимания только положительные.
- Два режима доступа: демо-режим и полный доступ через UUID профиля.

## Что не входит в MVP

- Регистрация аккаунтов и социальные функции.
- Отрицательные сигналы внимания и дизлайки.
- Объяснимость формирования ленты и глобальная персонализация.
- Перенос профиля между устройствами.

## Состав репозитория

- `src/` — backend (ingest, processing, API, storage).
- `web/` — клиентская PWA и интерфейс ленты.
- `ctx/` — когнитивный контекст и нормативная документация проекта.

## Требования

MindStream uses DEM 2 and DEM-RDB for its PostgreSQL schema, repositories, and connection lifecycle. PostgreSQL-specific feed queries borrow the same DEM-RDB-owned Knex connection. Both embedding columns use native pgvector storage.

- Node.js LTS 22 or later.
- PostgreSQL 16+ с расширением `pgvector`.
- Доступ к LLM API для генерации аннотаций, обзоров и эмбеддингов.

## Переменные окружения

- `TEQFW_WEB__PORT`
- `TEQFW_WEB__TYPE`
- `TEQFW_DEM_RDB__CLIENT`, `TEQFW_DEM_RDB__HOST`, `TEQFW_DEM_RDB__PORT`, `TEQFW_DEM_RDB__DATABASE`, `TEQFW_DEM_RDB__USER`, `TEQFW_DEM_RDB__PASSWORD`, `TEQFW_DEM_RDB__SEARCH_PATH`
- `MINDSTREAM__LLM_API_KEY`, `MINDSTREAM__LLM_BASE_URL`, `MINDSTREAM__LLM_GENERATION_MODEL`, `MINDSTREAM__LLM_EMBEDDING_MODEL`

Конфигурация загружается один раз в bootstrap через `@teqfw/cfg`: значения из `process.env` имеют приоритет над необязательным `.env`. Логи создаются через `@teqfw/log` с источником, соответствующим TeqFW-адресу компонента.

## Запуск (dev)

1. Установите зависимости: `npm install`.
2. Подготовьте базу PostgreSQL и один раз включите `pgvector` в схеме `public`:

```sql
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;
```

3. Populate `.env` from [the example](.env.example) with `TEQFW_DEM_RDB__SEARCH_PATH=public`. The application role needs `USAGE` and `CREATE` on `public`. Initial startup creates the application tables and DEM history there.
4. Обнаружьте публикации из RSS Хабра: `npm exec -- teq ingest:discover:habr`.
5. Извлеките тексты публикаций: `npm exec -- teq ingest:extract:habr`.
6. Сформируйте обзор и аннотацию: `npm exec -- teq process:generate:summaries`.
7. Сформируйте эмбеддинги: `npm exec -- teq process:generate:embeddings`.
8. Запустите сервер: `npm start` (это запускает команду `web:start` по умолчанию).

Generation commands use an external LLM API and require the `MINDSTREAM__LLM_*` settings.
После запуска откройте `http://localhost:3000`.

### One-time Production Schema Consolidation

1. Schedule maintenance, verify restoration of an independent backup, pause writers outside the deployment account, and keep deployments paused during the cutover. Review the deployment account's cron entries, including entries with the `# DEM-RDB maintenance:` prefix. The script re-enables those entries.
2. Dispatch **LIVE - Consolidate PostgreSQL into public once** on `main` with `maintenance_confirmed=true`. For a manual run as the production deployment account, use `bash .github/scripts/consolidate-postgresql.sh /path/to/app/mindstream` from a checkout containing the script and its companion SQL file.
3. The script pauses MindStream cron jobs, stops PM2, reads back a fresh backup, and runs the cleanup in one PostgreSQL transaction. It sets the deployed search path to `public`, starts PM2, and checks the local feed before resuming cron. Keep the backup and the saved configuration and crontab under `var/backups/postgresql/mindstream-pre-public.*` until cutover is accepted.
4. If a failure occurs after the database transaction commits, use the printed maintenance directory to recover. With a successfully migrated database, complete the configuration switch to `public`, restart PM2 and verify the feed before restoring `crontab.after`. For a full rollback, restore the pre-cutover dump and use `env.before` and `crontab.before`.

The legacy copy command remains available for recovery from a pre-DEM database. Its source and target schemas must be separate.

## Attention API (MVP)

`POST /api/attention` принимает write-события сигналов внимания.

Payload:

```json
{
  "identity": "uuid-string",
  "publication_id": 123,
  "attention_type": "overview_view | link_click | link_click_after_overview"
}
```

Успех: `204 No Content`.
Ошибки: `400` (некорректный payload), `422` (identity или публикация не найдены).

## Identity API (MVP)

`POST /api/identity` регистрирует anonymous identity.

Payload:

```json
{ "identity": "uuid-string" }
```

Ответ всегда `204 No Content`.

## Тесты

Быстрые локальные проверки: `npm test`. Команда запускает unit-тесты и проверки файлов приложения. Только unit-тесты: `npm run test:unit`.

Run the isolated DEM-RDB and migration checks with `npm run test:postgresql:dem`. Use a dedicated test database named `dem_rdb_test` with the `vector` extension in `public`, no tables in `public`, and no `mindstream_data` schema. The test role needs permission to create schemas and tables in `public`. By default, tests use the local Unix socket and the role in `USER`. Override the connection with `DEM_TEST_PG_DATABASE`, `DEM_TEST_PG_HOST`, `DEM_TEST_PG_PORT`, `DEM_TEST_PG_USER` and, if needed, `DEM_TEST_PG_PASSWORD`.
