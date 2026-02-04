declare global {
  type Mindstream_Back_App = import("./src/App.mjs").default;
  type Mindstream_Back_App_Configuration = import("./src/App/Configuration.mjs").default;
  type Mindstream_Shared_Logger = import("./web/app/Shared/Logger.mjs").default;
}

export {};
