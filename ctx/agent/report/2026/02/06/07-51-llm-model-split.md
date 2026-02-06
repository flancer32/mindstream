# Отчёт итерации

## Резюме изменений

Обновлена конфигурация LLM и тонкий OpenAI-клиент для разделения моделей генерации и эмбеддингов, синхронизирована документация структуры конфигурации и unit-тесты.

## Детали работ

- Обновлена структура LLM-конфигурации и чтение переменных окружения: `src/App/Configuration.mjs`, `ctx/docs/code/configuration/structure.md`.
- Обновлён тонкий OpenAI-клиент для использования `generationModel` и `embeddingModel` в `summarize()` и `embed()`: `src/Integration/OpenAi.mjs`.
- Актуализированы unit-тесты конфигурации и OpenAI-клиента: `test/unit/back/App/Configuration.test.mjs`, `test/unit/back/Integration/OpenAi.test.mjs`.

## Результаты

- LLM-конфигурация содержит два обязательных поля моделей: `generationModel` и `embeddingModel`.
- OpenAI-клиент использует разные модели для генерации текстов и эмбеддингов без участия processing-слоя.
- Unit-тесты выполнены: `npm run test:unit`.
