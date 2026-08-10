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

- Node.js LTS 20.x.
- PostgreSQL 16+ с расширением `pgvector`.
- Доступ к LLM API для генерации аннотаций, обзоров и эмбеддингов.

## Переменные окружения

- `TEQFW_WEB__PORT`
- `TEQFW_WEB__TYPE`
- `TEQFW_DB__CLIENT`, `TEQFW_DB__HOST`, `TEQFW_DB__PORT`, `TEQFW_DB__DATABASE`, `TEQFW_DB__USER`, `TEQFW_DB__PASSWORD`
- `MINDSTREAM__LLM_API_KEY`, `MINDSTREAM__LLM_BASE_URL`, `MINDSTREAM__LLM_GENERATION_MODEL`, `MINDSTREAM__LLM_EMBEDDING_MODEL`

Конфигурация загружается один раз в bootstrap через `@teqfw/cfg`: значения из `process.env` имеют приоритет над необязательным `.env`. Логи создаются через `@teqfw/log` с источником, соответствующим TeqFW-адресу компонента.

## Запуск (dev)

1. Установите зависимости: `npm install`.
2. Подготовьте PostgreSQL и включите `pgvector`:

```sql
CREATE EXTENSION vector;
```

3. Создайте схему в пустой базе: `npm exec -- teq db:schema:create`.
4. При необходимости пересоздать схему с переносом данных используйте: `npm exec -- teq db:schema:renew` (операция разрушительная).
5. Обнаружьте публикации из RSS Хабра: `npm exec -- teq ingest:discover:habr`.
6. Извлеките тексты публикаций: `npm exec -- teq ingest:extract:habr`.
7. Сформируйте обзор и аннотацию: `npm exec -- teq process:generate:summaries`.
8. Сформируйте эмбеддинги: `npm exec -- teq process:generate:embeddings`.
9. Запустите сервер: `npm start` (это запускает команду `fl32:web:start` по умолчанию).

Шаги 7–8 используют внешний LLM API и требуют заполненных `MINDSTREAM__LLM_*` переменных.
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
