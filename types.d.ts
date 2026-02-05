declare global {
  type Mindstream_Back_App = import("./src/App.mjs").default;
  type Mindstream_Back_App_Configuration = import("./src/App/Configuration.mjs").default;
  type Mindstream_Back_Storage_Schema = import("./src/Storage/Schema.mjs").default;
  type Mindstream_Back_Storage_SchemaManager = import("./src/Storage/SchemaManager.mjs").default;
  type Mindstream_Shared_Logger = import("./web/app/Shared/Logger.mjs").default;
}

export {};
