# Отчёт итерации — env-prefix-sync

Резюме изменений:
Синхронизированы имена env-переменных с нормативной структурой конфигурации: `server` → `SERVER_`, `llm` → `LLM_`. Обновлены код конфигурации, unit-тесты и `.env.example`.

Детали работ:
- `src/App/Configuration.mjs`: заменены `API_PORT` и `OPENAI_*` на `SERVER_PORT` и `LLM_*`.
- `test/unit/back/App/Configuration.test.mjs`: обновлены мок-значения окружения под новые имена.
- `.env.example`: обновлены имена переменных для `server` и `llm`.
- Выполнены unit-тесты `npm run test:unit`.

Результаты:
- Имена env-переменных согласованы с секциями `server` и `llm`.
- Тесты проходят успешно.
