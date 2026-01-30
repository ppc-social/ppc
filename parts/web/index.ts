import { type PPC, PartBase } from "../index.ts";

class WebClient extends PartBase {
  [key: string]: any;
  routes: any[] = [];

  static override async create(_ppc: PPC): Promise<WebClient> {
    const web = new WebClient();
    console.log("hello world from WebClient...");
    console.log("hoooooooooooooo");
    return web;
  }
}

export async function create(ppc: PPC) {
  if (ppc.config.is_client) {
    return await WebClient.create(ppc);
  } else {
    return (await import((() => "./server.ts")())).default.create(ppc); // to make client bundlers not include the blody server.ts file
  }
}

export const opts = {
  port: {
    default_val: 3000,
  },
  fastify_logging: {
    default_val: true,
  },
  host: {
    default_val: "https://ppc.social",
    env_var_name: "PPC_HOST",
  },
};
