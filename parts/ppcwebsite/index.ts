import { type PPC } from "../index.ts";

export const deps = ["web", "auth"];

export const opts = {
  host: {
    default_val: "https://ppc.social",
    env_var_name: "PPC_HOST",
  },
};

export async function remix_routes(defineRoutes: any, ppc: PPC) {
  return defineRoutes((route: any) => {
    route("/", "../ppcwebsite/main_page.tsx", { index: true });
    route("/dev", "../ppcwebsite/dev.tsx");
    route("/dev/one", "../ppcwebsite/dev-one.tsx", { index: true });
  });
}

export async function create(ppc: PPC) {
  return {
    run() {
      console.log("ppcwebsite run...");
    },
  };
}
