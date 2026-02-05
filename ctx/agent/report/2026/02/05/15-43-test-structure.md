# Отчёт итерации — test-structure

## Резюме изменений
- Тесты в `test/unit/back` приведены к структуре каталогов `src/`.
- Добавлен отдельный unit-тест для каждого backend-модуля.

## Детали работ
- Разнесены сценарии CLI по модульным файлам: диспетчер, db-ветка, runtime-ветка и leaf-команды.
- Разделены тесты хранения на `Schema` и `SchemaManager`.
- Перемещён тест конфигурации приложения в `test/unit/back/App/`.
- Исправлены относительные импорты helper-а `di-node.mjs`.

## Результаты
- Новые файлы: `test/unit/back/App/Cli/Dispatcher.test.mjs`, `test/unit/back/Cli/Db.test.mjs`, `test/unit/back/Cli/Db/Schema/Create.test.mjs`, `test/unit/back/Cli/Runtime.test.mjs`, `test/unit/back/Cli/Runtime/Serve.test.mjs`, `test/unit/back/Storage/Schema.test.mjs`, `test/unit/back/Storage/SchemaManager.test.mjs`.
- Перемещённый файл: `test/unit/back/App/Configuration.test.mjs`.
- Удалённые файлы: `test/unit/back/Cli.test.mjs`, `test/unit/back/StorageSchema.test.mjs`.
- Тесты: `npm run test:unit` (успешно).
