# Отчёт итерации

## Резюме изменений

Реализована CLI-команда `process:generate:embeddings` с обработкой эмбеддингов публикаций, добавлены статусы processing-контура для эмбеддингов, расширена схема хранения и добавлены unit-тесты. Обновлена инженерная документация по статусам публикаций.

## Детали работ

- Добавлены новые модули CLI и processing для генерации эмбеддингов и хранения эмбеддингов: `src/Cli/Process/Generate/Embeddings.mjs`, `src/Process/Generate/Embeddings.mjs`, `src/Process/Publication/EmbeddingStore.mjs`, обновлён диспетчер `src/Cli/Process.mjs` и список CLI-модулей в `src/Cli/AGENTS.md`.
- Расширен реестр статусов публикаций processing-контура и обновлён механизм генерации summary для фиксации `summary_ready`: `src/Process/Publication/Status.mjs`, `src/Process/Generate/Summaries.mjs`.
- Добавлена выборка публикаций под эмбеддинги и обновлена схема хранения: `src/Process/Publication/Store.mjs`, `src/Storage/Schema.mjs`, `types.d.ts`.
- Зафиксирован реестр статусов публикаций и переходов: `ctx/docs/code/publication-statuses.md`, обновлён `ctx/docs/code/AGENTS.md`.
- Добавлены и обновлены unit-тесты: `test/unit/back/Process/Generate/Embeddings.test.mjs`, `test/unit/back/Process/Generate/Summaries.test.mjs`, `test/unit/back/Process/Publication/Store.test.mjs`, `test/unit/back/Process/Publication/Status.test.mjs`, `test/unit/back/Storage/Schema.test.mjs`, `test/unit/back/App/Cli/Dispatcher.test.mjs`.

## Результаты

- Команда `process:generate:embeddings` зарегистрирована в CLI, идемпотентна, не инициирует downstream-этапы и логирует прогресс.
- Эмбеддинги хранятся отдельно и рассчитываются атомарно на основе аннотации и обзора.
- Статусы публикаций расширены и задокументированы.
- Unit-тесты выполнены: `npm run test:unit`.
