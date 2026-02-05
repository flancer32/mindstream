declare global {
  type Mindstream_Back_App = import("./src/App.mjs").default;
  type Mindstream_Back_App_Cli_Dispatcher = import("./src/App/Cli/Dispatcher.mjs").default;
  type Mindstream_Back_App_Configuration = import("./src/App/Configuration.mjs").default;
  type Mindstream_Back_Cli_Db = import("./src/Cli/Db.mjs").default;
  type Mindstream_Back_Cli_Db_Schema_Create = import("./src/Cli/Db/Schema/Create.mjs").default;
  type Mindstream_Back_Cli_Runtime = import("./src/Cli/Runtime.mjs").default;
  type Mindstream_Back_Cli_Runtime_Serve = import("./src/Cli/Runtime/Serve.mjs").default;
  type Mindstream_Back_Storage_Schema = import("./src/Storage/Schema.mjs").default;
  type Mindstream_Back_Storage_SchemaManager = import("./src/Storage/SchemaManager.mjs").default;
  type Mindstream_Shared_Logger = import("./web/app/Shared/Logger.mjs").default;
}

export {};
