# PostgreSQL — среда исполнения Mindstream (pgvector)

**Path:** `ctx/docs/environment/setup/postgresql.md`

---

## 1. Область ответственности документа

Документ описывает:

- минимальные требования к PostgreSQL;
- обязательное расширение `pgvector`;
- критерии корректной среды исполнения;
- операции резервного копирования и восстановления базы данных.

Документ **не описывает**:

- структуру схемы БД;
- доменные таблицы;
- миграции данных;
- логику storage-слоя.

---

## 2. Требования к PostgreSQL

Среда исполнения считается **корректной**, если выполняются все условия:

- PostgreSQL версии **16+**;
- одна база данных проекта Mindstream;
- возможность установки расширений (`superuser` или эквивалент);
- установленное и активированное расширение `pgvector`.

PostgreSQL без поддержки `pgvector` считается **некорректной средой исполнения**.

---

## 3. Установка расширения pgvector

### 3.1. Проверка версии PostgreSQL

```sh
psql --version
```

### 3.2. Установка пакета pgvector (Ubuntu / Debian)

```sh
sudo apt update
sudo apt install postgresql-16-pgvector
```

(номер версии заменить на фактический).

### 3.3. Перезапуск PostgreSQL

```sh
sudo systemctl restart postgresql
```

---

## 4. Активация pgvector в базе данных

### 4.1. Подключение к базе Mindstream

```sh
psql -d mindstream
```

### 4.2. Создание расширения

```sql
CREATE EXTENSION vector;
```

### 4.3. Проверка установки

```sql
SELECT extname FROM pg_extension WHERE extname = 'vector';
```

---

## 5. Проверка поддержки векторного типа

```sql
SELECT '[1,2,3]'::vector;
```

---

## 6. Использование в Mindstream

После подготовки PostgreSQL выполняются команды:

```text
db:schema:renew
process:generate:embeddings
```

Эмбеддинги сохраняются в колонках типа `vector(N)`.

---

## 7. Инварианты и ограничения

- `pgvector` является **обязательной зависимостью** storage-слоя;
- эмбеддинги не допускается хранить в JSON, массивах или текстовых полях;
- среды без `pgvector` не поддерживаются;
- в production расширение должно быть установлено **до запуска приложения**.

---

## 8. Резервное копирование базы данных

```sh
sudo -u postgres pg_dump \
  --format=custom \
  --clean \
  --if-exists \
  mindstream \
  | gzip > mindstream_$(date +%Y%m%d_%H%M%S).dump.gz
```

---

## 9. Восстановление базы данных

```sh
gunzip -c mindstream_YYYYMMDD_HHMMSS.dump.gz \
  | sudo -u postgres pg_restore \
      --clean \
      --if-exists \
      --role=mindstream \
      --dbname=mindstream
```

Проверка:

```sh
psql -U mindstream -d mindstream -c '\dt'
```

Все объекты базы данных должны принадлежать пользователю `mindstream`.

---

## 10. Критерий корректности среды

Среда PostgreSQL считается **корректно подготовленной**, если:

- PostgreSQL версии 16+ запущен;
- расширение `pgvector` установлено и активировано;
- тип `vector` доступен;
- операции `db:schema:renew` и `process:generate:embeddings` выполняются без ошибок;
- все объекты базы данных `mindstream` принадлежат пользователю `mindstream`.

---
