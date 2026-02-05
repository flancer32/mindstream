/**
 * @module Mindstream_Back_Storage_SchemaManager
 * @description Applies declarative DB schema using knex.
 */
export default class Mindstream_Back_Storage_SchemaManager {
  constructor({ Mindstream_Back_Storage_Schema$: schemaProvider, Mindstream_Shared_Logger$: logger, Mindstream_Back_Storage_Knex$: knexProvider }) {
    const NAMESPACE = 'Mindstream_Back_Storage_SchemaManager';
    const SCHEMA_TABLE = 'schema_version';
    const SCHEMA_VERSION_COLUMN = 'schema_version';
    const SCHEMA_JSON_COLUMN = 'schema_json';
    const SCHEMA_APPLIED_AT_COLUMN = 'applied_at';
    const getKnex = function () {
      return knexProvider.get();
    };

    const ensureError = function (err) {
      if (err instanceof Error) return err;
      return new Error(String(err));
    };

    const getDeclaration = function () {
      return schemaProvider.getDeclaration();
    };

    const assertSchema = function (schema) {
      if (!schema || typeof schema !== 'object') {
        throw new Error('Schema declaration is missing.');
      }
      if (typeof schema.schemaVersion !== 'number') {
        throw new Error('Schema version must be a number.');
      }
      if (!schema.tables || typeof schema.tables !== 'object') {
        throw new Error('Schema tables are missing.');
      }
      if (!schema.tables[SCHEMA_TABLE]) {
        throw new Error(`Schema version table "${SCHEMA_TABLE}" is missing.`);
      }
    };

    const getTableNames = function (schema) {
      return Object.keys(schema?.tables ?? {});
    };

    const buildTempTableName = function (tableName) {
      const stamp = Date.now();
      return `tmp_${tableName}_${stamp}`;
    };

    const createColumn = function (table, name, def) {
      const type = def?.type;
      if (!type) {
        throw new Error(`Column type is missing for "${name}".`);
      }

      switch (type) {
        case 'bigint':
          return def.autoIncrement ? table.bigIncrements(name) : table.bigInteger(name);
        case 'integer':
          return def.autoIncrement ? table.increments(name) : table.integer(name);
        case 'string':
          return def.length ? table.string(name, def.length) : table.string(name);
        case 'text':
          return table.text(name);
        case 'boolean':
          return table.boolean(name);
        case 'timestamp':
          return table.timestamp(name);
        case 'json':
          return table.json(name);
        default:
          throw new Error(`Unsupported column type "${type}" for "${name}".`);
      }
    };

    const createTable = async function (knexRef, tableName, tableDef) {
      const columns = tableDef?.columns ?? {};
      const primaryKey = Array.isArray(tableDef?.primaryKey) ? tableDef.primaryKey : null;
      const primaryColumns = [];

      await knexRef.schema.createTable(tableName, (table) => {
        for (const [columnName, columnDef] of Object.entries(columns)) {
          const column = createColumn(table, columnName, columnDef);
          if (columnDef.notNull) {
            column.notNullable();
          }
          if (columnDef.default !== undefined) {
            column.defaultTo(columnDef.default);
          }
          if (columnDef.primary && !columnDef.autoIncrement) {
            primaryColumns.push(columnName);
          }
        }

        if (primaryKey?.length) {
          table.primary(primaryKey);
        } else if (primaryColumns.length) {
          table.primary(primaryColumns);
        }
      });
    };

    const applyIndexes = async function (knexRef, schema) {
      const tableNames = getTableNames(schema);
      for (const tableName of tableNames) {
        const indexes = schema.tables[tableName]?.indexes ?? [];
        if (!indexes.length) continue;

        await knexRef.schema.alterTable(tableName, (table) => {
          for (const indexDef of indexes) {
            const columns = indexDef?.columns ?? [];
            if (!columns.length) {
              throw new Error(`Index columns are missing for table "${tableName}".`);
            }
            if (indexDef.unique) {
              table.unique(columns, indexDef.name);
            } else {
              table.index(columns, indexDef.name);
            }
          }
        });
      }
    };

    const applyForeignKeys = async function (knexRef, schema) {
      const tableNames = getTableNames(schema);
      for (const tableName of tableNames) {
        const foreignKeys = schema.tables[tableName]?.foreignKeys ?? [];
        if (!foreignKeys.length) continue;

        await knexRef.schema.alterTable(tableName, (table) => {
          for (const fkDef of foreignKeys) {
            const columns = fkDef?.columns ?? [];
            const reference = fkDef?.references ?? null;
            if (!columns.length || !reference?.table || !reference?.columns?.length) {
              throw new Error(`Foreign key definition is invalid for table "${tableName}".`);
            }

            const fk = table.foreign(columns, fkDef.name).references(reference.columns).inTable(reference.table);
            if (fkDef.onDelete) fk.onDelete(fkDef.onDelete);
            if (fkDef.onUpdate) fk.onUpdate(fkDef.onUpdate);
          }
        });
      }
    };

    const createTables = async function (knexRef, schema) {
      const tableNames = getTableNames(schema);
      for (const tableName of tableNames) {
        await createTable(knexRef, tableName, schema.tables[tableName]);
      }
    };

    const readSchemaState = async function (knexRef) {
      const exists = await knexRef.schema.hasTable(SCHEMA_TABLE);
      if (!exists) return { exists: false };

      const row = await knexRef(SCHEMA_TABLE).orderBy('id', 'desc').first();
      if (!row) return { exists: true, version: null, schema: null };

      let parsedSchema = null;
      if (row[SCHEMA_JSON_COLUMN]) {
        try {
          parsedSchema = JSON.parse(row[SCHEMA_JSON_COLUMN]);
        } catch (err) {
          logger.warn(NAMESPACE, 'Failed to parse stored schema JSON.');
        }
      }

      return {
        exists: true,
        version: Number(row[SCHEMA_VERSION_COLUMN]),
        schema: parsedSchema,
      };
    };

    const writeSchemaState = async function (knexRef, schema) {
      const payload = {
        [SCHEMA_VERSION_COLUMN]: schema.schemaVersion,
        [SCHEMA_JSON_COLUMN]: JSON.stringify(schema),
        [SCHEMA_APPLIED_AT_COLUMN]: new Date().toISOString(),
      };

      await knexRef(SCHEMA_TABLE).del();
      await knexRef(SCHEMA_TABLE).insert(payload);
    };

    const getExistingColumns = async function (knexRef, tableName) {
      try {
        const info = await knexRef(tableName).columnInfo();
        return Object.keys(info ?? {});
      } catch (err) {
        return [];
      }
    };

    const copyTableData = async function (knexRef, sourceTable, targetTable, columns) {
      if (!columns.length) return;
      await knexRef(targetTable).insert(knexRef.select(columns).from(sourceTable));
    };

    const withExecutor = async function (knexRef, handler) {
      if (knexRef && typeof knexRef.transaction === 'function') {
        await knexRef.transaction(async (trx) => {
          await handler(trx);
        });
        return;
      }
      await handler(knexRef);
    };

    const recreateWithPreserve = async function (knexRef, schema, previousSchema) {
      const newTables = getTableNames(schema);
      const oldTables = getTableNames(previousSchema);
      const tablesToDrop = oldTables.filter((name) => !newTables.includes(name));
      const tablesToPreserve = newTables.filter((name) => name !== SCHEMA_TABLE);
      const renameMap = {};

      await withExecutor(knexRef, async (executor) => {
        if (await executor.schema.hasTable(SCHEMA_TABLE)) {
          await executor.schema.dropTable(SCHEMA_TABLE);
        }

        for (const tableName of tablesToPreserve) {
          if (await executor.schema.hasTable(tableName)) {
            const tempName = buildTempTableName(tableName);
            await executor.schema.renameTable(tableName, tempName);
            renameMap[tableName] = tempName;
            logger.debug(NAMESPACE, `Renamed ${tableName} to ${tempName}.`);
          }
        }

        for (const tableName of tablesToDrop) {
          if (await executor.schema.hasTable(tableName)) {
            await executor.schema.dropTable(tableName);
            logger.debug(NAMESPACE, `Dropped obsolete table ${tableName}.`);
          }
        }

        await createTables(executor, schema);

        for (const [tableName, tempName] of Object.entries(renameMap)) {
          const newColumns = Object.keys(schema.tables[tableName]?.columns ?? {});
          const oldColumns = await getExistingColumns(executor, tempName);
          const columnsToCopy = newColumns.filter((column) => oldColumns.includes(column));
          if (columnsToCopy.length) {
            await copyTableData(executor, tempName, tableName, columnsToCopy);
            logger.debug(NAMESPACE, `Copied data into ${tableName}.`);
          }
          await executor.schema.dropTable(tempName);
        }

        await applyIndexes(executor, schema);
        await applyForeignKeys(executor, schema);
      });
    };

    const findMissingTables = async function (knexRef, schema) {
      const missing = [];
      for (const tableName of getTableNames(schema)) {
        const exists = await knexRef.schema.hasTable(tableName);
        if (!exists) missing.push(tableName);
      }
      return missing;
    };

    this.applySchema = async function () {
      const schema = getDeclaration();
      assertSchema(schema);

      try {
        const knexInstance = getKnex();
        const state = await readSchemaState(knexInstance);
        if (!state.exists) {
          logger.info(NAMESPACE, 'Schema version table is missing. Recreating schema.');
          await recreateWithPreserve(knexInstance, schema, null);
          await writeSchemaState(knexInstance, schema);
          return;
        }

        if (state.version !== schema.schemaVersion) {
          logger.info(
            NAMESPACE,
            `Schema version mismatch detected (db=${state.version}, declared=${schema.schemaVersion}). Recreating schema.`
          );
          await recreateWithPreserve(knexInstance, schema, state.schema);
          await writeSchemaState(knexInstance, schema);
          return;
        }

        const missingTables = await findMissingTables(knexInstance, schema);
        if (missingTables.length) {
          logger.warn(NAMESPACE, `Schema tables are missing: ${missingTables.join(', ')}. Recreating schema.`);
          await recreateWithPreserve(knexInstance, schema, state.schema);
          await writeSchemaState(knexInstance, schema);
          return;
        }

        logger.info(NAMESPACE, `Schema version ${schema.schemaVersion} is already applied.`);
      } catch (err) {
        logger.exception(NAMESPACE, ensureError(err));
        throw err;
      }
    };

    this.recreateWithPreserve = async function () {
      const schema = getDeclaration();
      assertSchema(schema);

      try {
        const knexInstance = getKnex();
        const state = await readSchemaState(knexInstance);
        await recreateWithPreserve(knexInstance, schema, state?.schema ?? null);
        await writeSchemaState(knexInstance, schema);
      } catch (err) {
        logger.exception(NAMESPACE, ensureError(err));
        throw err;
      }
    };

    this.createSchema = async function () {
      const schema = getDeclaration();
      assertSchema(schema);

      try {
        const knexInstance = getKnex();
        await createTables(knexInstance, schema);
        await applyIndexes(knexInstance, schema);
        await applyForeignKeys(knexInstance, schema);
        await writeSchemaState(knexInstance, schema);
      } catch (err) {
        logger.exception(NAMESPACE, ensureError(err));
        throw err;
      }
    };
  }
}
