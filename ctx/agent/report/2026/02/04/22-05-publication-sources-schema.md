# Отчёт: publication-sources-schema

## Резюме изменений
- Добавлена декларативная схема Storage с таблицами `schema_version` и `publication_sources`.
- Реализован менеджер применения схемы с recreate-with-preserve семантикой на `knex`.
- Добавлены unit-тесты для DI-разрешения схемы и менеджера, обновлены типы.

## Детали работ
- Созданы файлы `src/Storage/Schema.mjs` и `src/Storage/SchemaManager.mjs`.
- Обновлён `types.d.ts`.
- Добавлен тест `test/unit/back/StorageSchema.test.mjs`.
- Выполнены тесты: `npm run test:unit`.

## Результаты
- Декларативная схема и код применения доступны для ручного вызова.
- Unit-тесты завершились успешно.
