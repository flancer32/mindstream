# Отчёт итерации

## Резюме изменений

Пересобрал архитектурный слой документации под заданную структуру, устранил термин corpus, ввёл и закрепил термин Content Collection, обновил наименования, ссылки и содержимое ключевых архитектурных документов без изменения смысловых инвариантов.

## Детали работ

- Перестроил структуру `ctx/docs/architecture/` в соответствии с целевой схемой, выполнил переносы и удаления устаревших файлов и каталогов.
- Переписал `overview.md` с новыми архитектурными осями и контурами, добавил краткое диаграммное представление и уточнил границы.
- Обновил ingress-документы с фокусом на инфраструктурные границы, write-only потоки и отсутствие auth/roles.
- Пересобрал data-flow документы на базе термина Content Collection и обновил формулировки про write-only attention flows и условность передачи по identity.
- Создал и актуализировал документы инвариантов для Content Collection и Anonymous Identity.
- Перенёс и обновил attention storage invariants, синхронизировал ссылки между документами.
- Везде заменил corpus → Content Collection и удалил упоминания corpus в архитектурных текстах.

## Результаты

Обновлённые и созданные документы:

- `ctx/docs/architecture/AGENTS.md`
- `ctx/docs/architecture/overview.md`
- `ctx/docs/architecture/ingress/http-ingress.md`
- `ctx/docs/architecture/ingress/attention-write-ingress.md`
- `ctx/docs/architecture/data-flow/attention.md`
- `ctx/docs/architecture/data-flow/content-collection.md`
- `ctx/docs/architecture/content-collection/invariants.md`
- `ctx/docs/architecture/anonymous-identity/invariants.md`
- `ctx/docs/architecture/attention/interest-vector.md`
- `ctx/docs/architecture/attention/storage-invariants.md`
- `ctx/docs/architecture/storage/attention-storage-model.md`

Структурные изменения:

- Переименованы и перемещены файлы из corpus/ и storage/ в новые разделы Content Collection и Attention.
- Удалены устаревшие документы архитектурного уровня, не входящие в целевую структуру (ingestion/, representations/, runtime/, web/, data-flow.md и др.).

Тесты не запускались, так как изменения касаются только документации.
