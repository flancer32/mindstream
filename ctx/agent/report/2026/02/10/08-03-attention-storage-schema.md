# Отчёт об итерации — attention-storage-schema

## Резюме изменений
- Добавлены таблицы `anonymous_identities` и `attention_states` в декларацию схемы хранения внимания.
- Увеличена `schemaVersion` до 7.

## Детали работ
- Определены колонки, ключи, внешние ключи и индексы TTL в `src/Storage/Schema.mjs`.
- Добавлен CHECK constraint допустимых значений `attention_type` в декларации таблицы `attention_states`.

## Результаты
- Обновлён модуль `Mindstream_Back_Storage_Schema` с новыми таблицами и ограничениями.
- Тесты не запускались, так как изменялась только декларативная схема.
