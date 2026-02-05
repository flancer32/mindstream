# Отчёт итерации — cli-di-fix

## Резюме изменений
- Убран сервис-локатор: CLI-диспетчеры получают зависимости через DI-конструкторы, контейнер не передаётся за пределы composition root.
- Добавлены runtime-модули CLI для выполнения требования DI и структуры дерева команд.
- Тесты скорректированы под DI-цепочку и изоляцию зависимостей.

## Детали работ
- `bin/app.mjs` и `src/App.mjs` обновлены для запуска CLI без передачи DI-контейнера.
- `src/App/Cli/Dispatcher.mjs` и `src/Cli/Db.mjs` переведены на инъекцию зависимостей вместо обращений к контейнеру.
- Добавлены `src/Cli/Runtime.mjs` и `src/Cli/Runtime/Serve.mjs` для ветки `runtime:*`.
- Обновлены `types.d.ts` и `src/Cli/AGENTS.md`.
- Unit-тесты обновлены для явной регистрации стабов и предотвращения неявных цепочек DI.

## Результаты
- Кодовые изменения: `bin/app.mjs`, `src/App.mjs`, `src/App/Cli/Dispatcher.mjs`, `src/Cli/Db.mjs`, `src/Cli/Runtime.mjs`, `src/Cli/Runtime/Serve.mjs`, `src/Cli/AGENTS.md`, `types.d.ts`, `test/unit/back/App.test.mjs`, `test/unit/back/Cli.test.mjs`.
- Тесты: `npm run test:unit` (успешно).
