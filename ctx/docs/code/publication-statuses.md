# Code — Publication Statuses

Path: `./ctx/docs/code/publication-statuses.md`

## Назначение

Документ фиксирует нормативный реестр статусов публикаций в MVP Mindstream, их принадлежность к контурам и допустимые переходы между статусами.

## Реестр статусов

- `extract_pending` — ingestion, публикация зарегистрирована и ожидает извлечения md-текста.
- `extracted` — ingestion, md-текст публикации извлечён и сохранён.
- `extract_failed` — ingestion, временная ошибка извлечения md-текста.
- `extract_broken` — ingestion, извлечение md-текста признано невозможным.
- `summary_ready` — processing, md-аннотация и md-обзор сформированы.
- `summary_failed` — processing, генерация md-аннотации и md-обзора завершилась ошибкой.
- `embedding_pending` — processing, публикация ожидает расчёта эмбеддингов.
- `embedding_done` — processing, эмбеддинги аннотации и обзора сохранены.
- `embedding_failed` — processing, расчёт эмбеддингов завершился ошибкой.

## Допустимые переходы

- `extract_pending` -> `extracted`.
- `extract_pending` -> `extract_failed`.
- `extract_pending` -> `extract_broken`.
- `extract_failed` -> `extract_pending`.
- `extracted` -> `summary_ready`.
- `extracted` -> `summary_failed`.
- `summary_ready` -> `embedding_pending`.
- `embedding_pending` -> `embedding_done`.
- `embedding_pending` -> `embedding_failed`.

## Инварианты переходов

- `extract_broken` является терминальным состоянием ingestion-контура.
- `summary_failed` является терминальным состоянием processing-контура для генерации смысловых представлений.
- `embedding_failed` является терминальным состоянием processing-контура для расчёта эмбеддингов.
- Переходы, отсутствующие в реестре, считаются недопустимыми.
