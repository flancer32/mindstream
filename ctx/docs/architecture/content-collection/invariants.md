# Content Collection Invariants

Path: `./ctx/docs/architecture/content-collection/invariants.md`

## Назначение

Документ фиксирует архитектурные инварианты **Content Collection** в MVP Mindstream.

Content Collection рассматривается как технический набор публикаций и их производных представлений, используемый как материал для feed и внимания.

Документ определяет, что включено и что исключено из Content Collection, а также её связь с другими архитектурными осями без описания схем хранения или реализации.

---

## Определение Content Collection

Content Collection — это:

- канонический набор публикаций и их производных представлений;
- общий источник данных для read-представлений;
- результат Content Collection flows серверных контуров.

Content Collection:

- не персонализирована;
- не зависит от anonymous identity;
- не зависит от attention-сигналов;
- не трактуется как модель «реальности».

Публикация является атомарным артефактом Content Collection.

---

## Что включено

В Content Collection включаются:

- публикации, принятые серверными потоками ingestion;
- производные представления публикаций (annotation, overview);
- embeddings, полученные из производных представлений.

---

## Что исключено

В Content Collection не включаются:

- данные anonymous identity;
- attention-сигналы и любые производные статистики внимания;
- персонализированные read-модели;
- UI-состояния и пользовательские контексты.

---

## Связь с другими осями

### Anonymous Identity

Content Collection не содержит ссылок на anonymous identity и существует независимо от наличия или отсутствия identity.

### Attention

Attention является внешним наблюдением над Content Collection и не влияет на её состав или структуру.

### Ingress и Storage

Content Collection формируется только серверными потоками и сохраняется в каноническом storage без реактивных обратных связей.

---

## Lifecycle публикаций

### Появление

Публикации появляются в Content Collection через серверные потоки ingestion и content processing.

### Изменение

Content Collection допускает обновление и замену производных представлений публикаций без изменения архитектурного статуса публикации.

### Удаление

Удаление публикации из Content Collection приводит к каскадной очистке связанных attention-данных и не инициирует обратных потоков.

---

## Границы и запреты

В рамках MVP запрещено:

- персонализировать Content Collection на основе attention или identity;
- использовать Content Collection как реакцию на пользовательские сигналы;
- хранить внутри Content Collection данные, производные от внимания;
- рассматривать Content Collection как read-модель для identity.

---

## Связанные документы

- `ctx/docs/architecture/data-flow/content-collection.md`
- `ctx/docs/architecture/data-flow/attention.md`
- `ctx/docs/architecture/attention/storage-invariants.md`

---

## Итог

Content Collection в архитектуре Mindstream является каноническим, неперсонализированным техническим набором публикаций, независимым от attention и anonymous identity и используемым как материал для feed и внимания в рамках MVP.
