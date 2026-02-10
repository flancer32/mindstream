# Mindstream — MVP персональной смысловой ленты

Этот репозиторий — приложение из статьи на Хабре «От идей к коду: проверяю теорию внимания на практике».
Ссылка: https://habr.com/ru/articles/995070/

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

- Node.js LTS 20.x.
- PostgreSQL 16+ с расширением `pgvector`.
- Доступ к LLM API для генерации аннотаций, обзоров и эмбеддингов.

## Переменные окружения

- `SERVER_PORT`
- `SERVER_TYPE`
- `DB_CLIENT`
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USER`
- `DB_PASSWORD`
- `LLM_API_KEY`
- `LLM_BASE_URL`
- `LLM_GENERATION_MODEL`
- `LLM_EMBEDDING_MODEL`

## Запуск (dev)

1. Установите зависимости: `npm install`.
2. Подготовьте PostgreSQL и включите `pgvector`:

```sql
CREATE EXTENSION vector;
```

3. Создайте схему в пустой базе: `node ./bin/app.mjs db:schema:create`.
4. При необходимости пересоздать схему с переносом данных используйте: `node ./bin/app.mjs db:schema:renew` (операция разрушительная).
5. Обнаружьте публикации из RSS Хабра: `node ./bin/app.mjs ingest:discover:habr`.
6. Извлеките тексты публикаций: `node ./bin/app.mjs ingest:extract:habr`.
7. Сформируйте обзор и аннотацию: `node ./bin/app.mjs process:generate:summaries`.
8. Сформируйте эмбеддинги: `node ./bin/app.mjs process:generate:embeddings`.
9. Запустите сервер: `npm start`.

Шаги 7–8 используют внешний LLM API и требуют заполненных `LLM_*` переменных.
После запуска откройте `http://localhost:3000`.

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

`npm run test:unit`
