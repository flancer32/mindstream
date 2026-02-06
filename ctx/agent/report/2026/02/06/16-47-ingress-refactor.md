# Отчёт об итерации

Цель: выделить ingress-документацию в подкаталог `ctx/docs/architecture/ingress/` с актуализацией путей и ссылок без изменения архитектурных смыслов.

## Резюме изменений

- Создан подкаталог `ctx/docs/architecture/ingress/` и перенесены ingress-документы.
- Обновлены `Path:` внутри ingress-документов и ссылки на них в архитектурных файлах.
- Обновлена карта уровня в `ctx/docs/architecture/AGENTS.md` с добавлением `ingress/`.

## Детали работ

- Перемещены файлы `ctx/docs/architecture/cli-ingress.md`, `ctx/docs/architecture/http-ingress.md`, `ctx/docs/architecture/frontend-data-ingress.md` в `ctx/docs/architecture/ingress/`.
- Обновлены пути в ingress-документах и ссылки в `ctx/docs/architecture/overview.md`, `ctx/docs/architecture/runtime/bootstrap.md`, `ctx/docs/architecture/runtime/http-runtime.md`.
- Актуализирована карта уровня в `ctx/docs/architecture/AGENTS.md`.

## Результаты

- Ingress-документация сгруппирована в `ctx/docs/architecture/ingress/` без изменения архитектурных инвариантов.
- Ссылки и пути приведены к новому расположению файлов.
- Тесты не запускались, изменения носят исключительно документальный характер.
