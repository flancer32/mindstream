# Отчёт итерации

## Резюме изменений

Добавлена команда `ingest:extract:habr` и базовый ingestion-экстрактор для Habr с хранением HTML и md-текста, статусной моделью публикаций и обновлением схемы хранения. Обновлена архитектурная и CLI-документация и добавлены unit-тесты для extraction-потока.

## Детали работ

Обновлено дерево CLI и CLI-модули для `ingest:extract:habr`, добавлены сервисы extraction, fetch и парсер Habr, а также хранилище результатов extraction. Расширены таблицы хранения публикаций статусом и добавлена сущность `publication_extractions` с фиксацией HTML и md-текста. Обновлены документация по статусам extraction и каноническое CLI-дерево. Добавлены unit-тесты для extraction-оркестратора и расширены тесты схемы хранения.

## Результаты

Изменённые файлы и артефакты:
- `src/Cli/Ingest.mjs`
- `src/Cli/Ingest/Extract/Habr.mjs`
- `src/Cli/AGENTS.md`
- `src/Ingest/Extract/Habr.mjs`
- `src/Ingest/Extract/Habr/Fetcher.mjs`
- `src/Ingest/Extract/Habr/Parser.mjs`
- `src/Ingest/Publication/Store.mjs`
- `src/Ingest/Publication/Status.mjs`
- `src/Ingest/Publication/ExtractionStore.mjs`
- `src/Platform/Fetch.mjs`
- `src/Storage/Schema.mjs`
- `types.d.ts`
- `test/unit/back/Ingest/Extract/Habr.test.mjs`
- `test/unit/back/Storage/Schema.test.mjs`
- `ctx/docs/code/cli/command-tree.md`
- `ctx/docs/architecture/ingestion/extraction-workflow.md`

Тесты:
- `npm run test:unit`

