# Отчёт итерации — feed-resolve-embedding

## Резюме изменений
- Устранена ссылка на удалённый `resolveEmbedding` в ленте.

## Детали работ
- Удалена лишняя проверка `resolveEmbedding` при инициализации attention, оставлена проверка внутри адаптера: `web/ui/js/feed.mjs`.

## Результаты
- Ошибка `ReferenceError: resolveEmbedding is not defined` устранена.
- Инициализация attention продолжает валидировать наличие эмбеддингов через адаптер.
