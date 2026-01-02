import { runPPCApp } from "../parts/index.ts";

export const config = {
  app_type: "server",
  parts: ["ppcwebsite"],
};

if (import.meta.main) {
  runPPCApp(config);
}
