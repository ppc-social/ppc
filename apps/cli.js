import { runPPCApp } from "./parts";
export const config = {
  app_type: "cli",
  parts: ["cli", "c2vi"],
};
runPPCApp(config);
