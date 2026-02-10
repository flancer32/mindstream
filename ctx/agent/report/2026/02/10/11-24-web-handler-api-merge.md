# Отчёт итерации: объединение web-api handler

## Резюме изменений

Объединены `Mindstream_Back_Web_Api_Dispatcher` и `Mindstream_Back_Web_Handler_Api` в новый `Mindstream_Back_Web_Handler`, а API-обработчики внимания и регистрации идентичности перенесены в namespace `Mindstream_Back_Web_Api_` с путями `/api/attention` и `/api/identity`.

## Детали работ

- Добавлены API-модули `Mindstream_Back_Web_Api_Attention` и `Mindstream_Back_Web_Api_Identity`.
- Создан `Mindstream_Back_Web_Handler` с маршрутизацией `/api/*` на эндпоинты `/feed`, `/attention`, `/identity` и fallback.
- Удалены устаревшие `src/Web/Api/Dispatcher.mjs`, `src/Web/Handler/Api.mjs`, `src/Web/Handler/Attention.mjs`.
- Обновлены тесты backend (handler, server, attention, identity) и `types.d.ts`.

## Результаты

- Обновлены файлы: `src/Web/Handler.mjs`, `src/Web/Api/Attention.mjs`, `src/Web/Api/Identity.mjs`, `src/Web/Server.mjs`, `types.d.ts`.
- Обновлены/добавлены тесты: `test/unit/back/Web/Handler/Api.test.mjs`, `test/unit/back/Web/Handler/Attention.test.mjs`, `test/unit/back/Web/Server.test.mjs`, `test/unit/back/Web/Api/Identity.test.mjs`. Удалён `test/unit/back/Web/Api/Dispatcher.test.mjs`.
- Тесты запущены: `npm run test:unit` (ошибка в `test/unit/back/Process/Generate/Embeddings.test.mjs` и `test/unit/back/Process/Generate/Summaries.test.mjs`, обе завершились с `ERR_TEST_FAILURE`).
