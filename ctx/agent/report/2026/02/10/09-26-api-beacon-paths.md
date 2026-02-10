# Отчёт итерации: api paths for beacons

## Резюме изменений

Обновлены пути beacon-запросов: все вызовы `/identity` и `/attention` теперь отправляются на `/api/identity` и `/api/attention`.

## Детали работ

- `web/ui/js/identity.mjs`: пути `sendBeacon` для регистрации идентичности и сигналов внимания приведены к `/api/*`.

## Результаты

- Обновлён файл `web/ui/js/identity.mjs`.
- Тесты не запускались (изменения только в frontend).
