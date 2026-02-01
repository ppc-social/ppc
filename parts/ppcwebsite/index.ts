import { type PPC } from "../index.ts";

export const deps = ["web", "auth", "instant"];

export async function remix_routes(defineRoutes: any, ppc: PPC) {
  return defineRoutes((route: any) => {
    route("/dev", "../ppcwebsite/dev.tsx");
    route("/dev/one", "../ppcwebsite/dev-one.tsx", { index: true });
    if (!ppc.config.isSPA) {
      route("/", "../ppcwebsite/main_page.tsx", { index: true });
    }
  });
}

export async function init(ppc: PPC) {
  ppc.ppcwebsite = {
    isPPCPart: true,
    run() {
      console.log("ppcwebsite run...");
    },
  };
}
