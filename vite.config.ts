import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import { createPPCApp, type PPC } from "./parts";
import tsconfigPaths from "vite-tsconfig-paths";
import { DefineRouteFunction } from "@remix-run/dev/dist/config/routes";
import builtins from "builtin-modules";
import { viteSingleFile } from "vite-plugin-singlefile";

type myDefineRoutesFn = (callback: DefineRouteFunction) => void;

declare module "@remix-run/server-runtime" {
  interface Future {
    unstable_singleFetch: true;
  }
}

// read app_type from env var
const app_type = process.env.PPC_APP_TYPE || "server";

// this vite config is for the server, so use this config
export let config = {
  app_type: "server",
  parts: ["ppcwebsite"],
};
config.config_only = true;
config.isSPA = false;
const ppc: PPC = await createPPCApp(config);

export default defineConfig({
  resolve: {
    alias: {
      // Maps '@' to the 'src' directory
      "@": path.resolve(__dirname, "./parts"),
    },
  },
  plugins: [
    //viteSingleFile(),
    tsconfigPaths({
      skip: (dir) => dir.startsWith("gitignore"), // because ppcdev puts intant src into gitigonre/data/instant/src ... and we would scan the tsconfig files in there
    }),
    remix({
      ssr: true,
      ignoredRouteFiles: ["/gitignore"],
      appDirectory: "./parts/web/",
      async routes(defineRoutes) {
        const defineRoutesFns: myDefineRoutesFn[] = [];
        for (const part_name of ppc.config.part_names) {
          const part = await ppc.getPartDefinition(part_name);
          if (part.remix_routes) {
            console.log("part:", part_name);
            await part.remix_routes((definition: myDefineRoutesFn) => {
              defineRoutesFns.push(definition);
            }, ppc);
          }
        }
        return defineRoutes((route) => {
          defineRoutesFns.forEach((fn: myDefineRoutesFn) => fn(route));
        });
      },

      future: {
        unstable_singleFetch: true,
      },
    }),
  ],
});
