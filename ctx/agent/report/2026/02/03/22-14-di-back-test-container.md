# Отчёт итерации — di-back-test-container

## Резюме изменений
- Добавлен ES6-модуль для создания тестового DI-контейнера бэкенда с поддержкой test mode и моков окружения.

## Детали работ
- Создан файл `test/unit/di-back.mjs` с настройкой resolver для `Mindstream_Back_`, `Mindstream_Shared_` и `Teqfw_Di_`, поддержкой replacements, регистрации моков и переопределения `node:process` по `env`.

## Результаты
- Готов helper для unit-тестов бэкенда: `test/unit/di-back.mjs`.
- Тесты не запускались.
