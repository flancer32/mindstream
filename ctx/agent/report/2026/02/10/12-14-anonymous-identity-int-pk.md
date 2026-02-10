# Отчёт итерации: anonymous_identities integer PK

## Резюме изменений

Первичный ключ таблицы `anonymous_identities` переведён на числовой `id`, добавлен уникальный `identity_uuid`, а связанные API/ингресс и тесты обновлены для работы через UUID → id.

## Детали работ

- `src/Storage/Schema.mjs`: `anonymous_identities` теперь имеет `id` (bigint PK) и `identity_uuid` (unique), `attention_states.identity_id` стал bigint; версия схемы повышена до 8.
- `src/Attention/Ingress.mjs`: поиск identity выполняется по `identity_uuid` с получением числового `id` для записи attention.
- `src/Web/Api/Identity.mjs`: регистрация identity пишет `identity_uuid` и использует `ON CONFLICT(identity_uuid)`.
- Обновлены тесты: `test/unit/back/Web/Handler/Attention.test.mjs`, `test/unit/back/Web/Api/Identity.test.mjs`.

## Результаты

- Обновлены файлы: `src/Storage/Schema.mjs`, `src/Attention/Ingress.mjs`, `src/Web/Api/Identity.mjs`, `test/unit/back/Web/Handler/Attention.test.mjs`, `test/unit/back/Web/Api/Identity.test.mjs`.
- Тесты запущены: `npm run test:unit`.
- Ошибки тестов: `test/unit/back/Process/Generate/Embeddings.test.mjs`, `test/unit/back/Process/Generate/Summaries.test.mjs` (ERR_TEST_FAILURE, причины не раскрыты в TAP-выводе; падали ранее).
