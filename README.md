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

3. Создайте отдельную целевую схему:

```sql
CREATE SCHEMA mindstream_data AUTHORIZATION mindstream;
```

4. Заполните `.env` по [примеру](.env.example). Задайте `TEQFW_DEM_RDB__SEARCH_PATH=mindstream_data,public`. При первом запуске приложение создаёт таблицы и историю модели в `mindstream_data`.
5. Для переноса legacy-данных остановите процессы записи, сделайте отдельную резервную копию и проверьте её восстановлением в изолированной базе. Затем запустите `npm run db:migrate-legacy -- --source-schema=public`. Для другой исходной схемы укажите её имя. [Требования к переключению](ctx/docs/environment/setup/postgresql.md#backup-and-cutover).
6. Обнаружьте публикации из RSS Хабра: `npm exec -- teq ingest:discover:habr`.
7. Извлеките тексты публикаций: `npm exec -- teq ingest:extract:habr`.
8. Сформируйте обзор и аннотацию: `npm exec -- teq process:generate:summaries`.
9. Сформируйте эмбеддинги: `npm exec -- teq process:generate:embeddings`.
10. Запустите сервер: `npm start` (это запускает команду `web:start` по умолчанию).

Миграционная команда инициализирует целевые таблицы и историю DEM до транзакции копирования. При ошибке копирования транзакция откатывается, а целевая схема остаётся инициализированной с пустыми таблицами данных. Исходные таблицы сохраняются. Шаги 8–9 используют внешний LLM API и требуют заполненных `MINDSTREAM__LLM_*` переменных.
После запуска откройте `http://localhost:3000`.

### Production DEM-RDB migration

1. Schedule maintenance and verify that an independent PostgreSQL backup can be restored. Pause any writers outside the deployment account.
2. Dispatch **LIVE - Migrate Mindstream to DEM-RDB once** on `main` with `maintenance_confirmed=true`. The workflow pauses Mindstream entries in the deployment account's crontab, stops `mindstream-web` in PM2, checks for other database clients, and saves and reads back a full archive under `var/backups/postgresql` on the deployment host. It then migrates `public` into `mindstream_data` and records the archive path in `mindstream-dem-rdb.completed`.
3. Review the migration result and verify the target before resuming writers. Configure and start the new release with the matching `TEQFW_DEM_RDB__*` connection settings and `TEQFW_DEM_RDB__SEARCH_PATH=mindstream_data,public`. Review the saved deployment crontab before re-enabling its jobs. Keep the archive and the previous release available for rollback until cutover is accepted.

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

Изолированные PostgreSQL-проверки DEM-RDB и переноса данных: `npm run test:postgresql:dem`. Нужна отдельная тестовая БД `dem_rdb_test` с доступной в `public` extension `vector` и правами пользователя на создание и удаление схем. По умолчанию тесты подключаются через локальный Unix socket, используя пользователя из `USER`. Для другой настройки подключения задайте `DEM_TEST_PG_DATABASE`, `DEM_TEST_PG_HOST`, `DEM_TEST_PG_PORT`, `DEM_TEST_PG_USER` и при необходимости `DEM_TEST_PG_PASSWORD`.
