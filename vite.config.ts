import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import { createPPCApp, type PPC } from "./parts";
import tsconfigPaths from "vite-tsconfig-paths";
import { DefineRouteFunction } from "@remix-run/dev/dist/config/routes";

type myDefineRoutesFn = (callback: DefineRouteFunction) => void;

declare module "@remix-run/server-runtime" {
  interface Future {
    unstable_singleFetch: true;
  }
}

// always run the server app (in ./apps/server.ts)
const config: any = (await import("./apps/server.ts")).config;
config.config_only = true;
const ppc: PPC = await createPPCApp(config);

export default defineConfig({
  plugins: [
    tsconfigPaths({
      skip: (dir) => dir.startsWith("gitignore"), // because ppcdev puts intant src into gitigonre/data/instant/src ... and we would scan the tsconfig files in there
    }),
    remix({
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
          console.log("hii", defineRoutesFns);
          defineRoutesFns.forEach((fn: myDefineRoutesFn) => fn(route));
        });
      },

      future: {
        unstable_singleFetch: true,
      },
    }),
  ],
});
