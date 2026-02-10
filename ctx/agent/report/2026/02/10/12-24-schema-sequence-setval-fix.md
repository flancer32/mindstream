# Отчёт итерации: fix pg sequence setval for empty tables

## Резюме изменений

Исправлена синхронизация PostgreSQL sequence в `SchemaManager`: теперь `setval` безопасно работает на пустых таблицах (не устанавливается значение 0). Обновлены unit-тесты на новую сигнатуру `setval`.

## Детали работ

- `src/Storage/SchemaManager.mjs`: `setval` теперь использует `COALESCE(MAX(id), 1)` и третий аргумент `is_called` для корректного старта sequence.
- `test/unit/back/Storage/SchemaManager.test.mjs`: обновлены ожидания SQL и bindings.

## Результаты

- Обновлены файлы: `src/Storage/SchemaManager.mjs`, `test/unit/back/Storage/SchemaManager.test.mjs`.
- Тесты запущены: `npm run test:unit`.
- Ошибки тестов: `test/unit/back/Process/Generate/Embeddings.test.mjs`, `test/unit/back/Process/Generate/Summaries.test.mjs` (ERR_TEST_FAILURE, причины не раскрыты в выводе; падали ранее).
