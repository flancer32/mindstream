# PostgreSQL — настройка для Mindstream (pgvector)

Path: `ctx/docs/environment/setup/postgresql.md`

Назначение: обеспечить корректную работу эмбеддингов в MVP Mindstream.

## 1. Требования

- PostgreSQL версии **16+**.
- Доступ к установке расширений (superuser или эквивалентные права).
- Одна база данных Mindstream.

PostgreSQL без поддержки `pgvector` считается некорректной средой исполнения.

---

## 2. Установка расширения pgvector

### Ubuntu / Debian (PostgreSQL из apt)

Определи версию PostgreSQL:

```
psql --version
```

Установи пакет pgvector для своей версии PostgreSQL:

```
sudo apt update
sudo apt install postgresql-16-pgvector
```

(для других версий заменить `16` на фактическую).

Перезапусти PostgreSQL:

```
sudo systemctl restart postgresql
```

---

## 3. Подключение расширения в базе данных

Подключись к базе Mindstream:

```
psql -d mindstream
```

Выполни:

```sql
CREATE EXTENSION vector;
```

Проверка:

```sql
SELECT extname FROM pg_extension WHERE extname = 'vector';
```

Ожидаемый результат — одна строка `vector`.

---

## 4. Проверка поддержки векторов

```sql
SELECT '[1,2,3]'::vector;
```

Если выражение выполняется без ошибки — `pgvector` работает корректно.

---

## 5. Работа с Mindstream

После установки расширения:

1. Выполни пересборку схемы:

   ```
   db:schema:renew
   ```

2. Пересчитай эмбеддинги:

   ```
   process:generate:embeddings
   ```

Эмбеддинги будут сохранены в колонках типа `vector(N)`.

---

## 6. Важные ограничения

- `pgvector` — обязательная зависимость storage-слоя.
- Эмбеддинги **не хранятся** как JSON или массивы.
- Среды PostgreSQL без `pgvector` не поддерживаются.
- В production расширение должно быть установлено **до** запуска приложения.
