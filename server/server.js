import { runPPCApp } from "../parts";
export const config = {
    app_type: "server",
    parts: ["ppcwebsite"],
};
runPPCApp(config);
