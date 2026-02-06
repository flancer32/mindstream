# Отчёт итерации — process-generate-summaries

## Резюме изменений
- Реализована CLI-команда `process:generate:summaries` и диспетчер `process:*`.
- Добавлен processing-контур генерации обзора и аннотации через LLM с сохранением в хранилище и обработкой ошибок.
- Расширена схема хранения для канонических обзоров и аннотаций.
- Добавлены unit-тесты для новой команды и генерации, обновлён `types.d.ts` и карта CLI.

## Детали работ
- Добавлены модули processing-слоя: генератор, store публикаций для выборки, store канонических summaries, каталог статусов.
- Внедрена генерация LLM с жёстким JSON-форматом ответа и парсингом результата.
- Ошибки генерации логируются через `Mindstream_Shared_Logger.exception`, публикация переводится в статус `summary_failed` без остановки батча.
- Схема БД дополнена таблицей `publication_summaries`, версия схемы увеличена до 4.
- CLI-диспетчер приложения расширен веткой `process`.

## Артефакты
- `src/App/Cli/Dispatcher.mjs`
- `src/Cli/AGENTS.md`
- `src/Cli/Process.mjs`
- `src/Cli/Process/Generate/Summaries.mjs`
- `src/Process/Generate/Summaries.mjs`
- `src/Process/Publication/Status.mjs`
- `src/Process/Publication/Store.mjs`
- `src/Process/Publication/SummaryStore.mjs`
- `src/Storage/Schema.mjs`
- `test/unit/back/Process/Generate/Summaries.test.mjs`
- `test/unit/back/Cli/Process/Generate/Summaries.test.mjs`
- `test/unit/back/Storage/Schema.test.mjs`
- `types.d.ts`

## Тестирование
- `npm run test:unit`

## Примечания
- Новые зависимости не добавлялись.
