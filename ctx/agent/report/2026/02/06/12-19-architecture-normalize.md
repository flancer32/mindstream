# Отчёт

Цель: нормализовать архитектурную документацию Mindstream по критериям ADSM, устранив противоречия, дублирование и очевидные формулировки без изменения MVP-инвариантов.

Действия:
- Устранил терминологический конфликт ingress в `ctx/docs/architecture/ingestion/sources-and-identity.md`.
- Уточнил инварианты и требования по CLI/HTTP ingress, добавил UUID-идентификацию и batch-only ограничения, перенёс статус ingress-документов в `ctx/docs/architecture/overview.md`.
- Добавил упоминание ingress-границ в `ctx/docs/architecture/overview.md` и ссылку на ограничения потоков.
- Убрал дублирующиеся запреты и многословные формулировки в `ctx/docs/architecture/data-flow/*` и `ctx/docs/architecture/overview.md`, оставив единый источник ограничений в `ctx/docs/architecture/data-flow.md`.
- Разделил архитектурную модель bootstrap и референсный код, вынеся реализацию в `ctx/docs/code/bootstrap-reference.md` и обновив ссылки.
- Обновил карту уровня `ctx/docs/code/AGENTS.md`.

Артефакты:
- `ctx/docs/architecture/ingestion/sources-and-identity.md`
- `ctx/docs/architecture/cli-ingress.md`
- `ctx/docs/architecture/http-ingress.md`
- `ctx/docs/architecture/overview.md`
- `ctx/docs/architecture/data-flow/attention.md`
- `ctx/docs/architecture/data-flow/corpus.md`
- `ctx/docs/architecture/data-flow/transfer.md`
- `ctx/docs/architecture/runtime/bootstrap.md`
- `ctx/docs/code/bootstrap-reference.md`
- `ctx/docs/code/AGENTS.md`
