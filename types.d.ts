declare global {
  type Mindstream_Back_App = import("./src/App.mjs").default;
  type Mindstream_Back_App_Cli_Dispatcher = import("./src/App/Cli/Dispatcher.mjs").default;
  type Mindstream_Back_App_Configuration = import("./src/App/Configuration.mjs").default;
  type Mindstream_Back_Cli_Db = import("./src/Cli/Db.mjs").default;
  type Mindstream_Back_Cli_Db_Schema_Create = import("./src/Cli/Db/Schema/Create.mjs").default;
  type Mindstream_Back_Cli_Ingest = import("./src/Cli/Ingest.mjs").default;
  type Mindstream_Back_Cli_Ingest_Discover_Habr = import("./src/Cli/Ingest/Discover/Habr.mjs").default;
  type Mindstream_Back_Cli_Ingest_Extract_Habr = import("./src/Cli/Ingest/Extract/Habr.mjs").default;
  type Mindstream_Back_Cli_Runtime = import("./src/Cli/Runtime.mjs").default;
  type Mindstream_Back_Cli_Runtime_Serve = import("./src/Cli/Runtime/Serve.mjs").default;
  type Mindstream_Back_Ingest_Discover_Habr = import("./src/Ingest/Discover/Habr.mjs").default;
  type Mindstream_Back_Ingest_Extract_Habr = import("./src/Ingest/Extract/Habr.mjs").default;
  type Mindstream_Back_Ingest_Extract_Habr_Fetcher = import("./src/Ingest/Extract/Habr/Fetcher.mjs").default;
  type Mindstream_Back_Ingest_Extract_Habr_Parser = import("./src/Ingest/Extract/Habr/Parser.mjs").default;
  type Mindstream_Back_Ingest_Publication_ExtractionStore = import("./src/Ingest/Publication/ExtractionStore.mjs").default;
  type Mindstream_Back_Ingest_Publication_Status = import("./src/Ingest/Publication/Status.mjs").default;
  type Mindstream_Back_Ingest_Publication_Store = import("./src/Ingest/Publication/Store.mjs").default;
  type Mindstream_Back_Ingest_Rss_Client = import("./src/Ingest/Rss/Client.mjs").default;
  type Mindstream_Back_Ingest_Rss_Parser = import("./src/Ingest/Rss/Parser.mjs").default;
  type Mindstream_Back_Ingest_Source_Habr = import("./src/Ingest/Source/Habr.mjs").default;
  type Mindstream_Back_Platform_Fetch = import("./src/Platform/Fetch.mjs").default;
  type Mindstream_Back_Storage_Knex = import("./src/Storage/Knex.mjs").default;
  type Mindstream_Back_Storage_Schema = import("./src/Storage/Schema.mjs").default;
  type Mindstream_Back_Storage_SchemaManager = import("./src/Storage/SchemaManager.mjs").default;
  type Mindstream_Shared_Logger = import("./web/app/Shared/Logger.mjs").default;
}

export {};
