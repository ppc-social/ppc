import { type PPC, PartBase } from "../index.ts";

class WebServer extends PartBase {
  [key: string]: any;
  routes: any[] = [];

  static override async create(ppc: PPC): Promise<WebServer> {
    const tmp = "fas" + "tify";
    const Fastify = (await import(tmp + "")).default;
    const sourceMapSupport = await import("source-map-support");
    this.remixFastify = import("@mcansh/remix-" + tmp);

    sourceMapSupport.install();

    const web = new WebServer();

    web.ppc = ppc;

    web.fastify = Fastify({
      logger: ppc.config.fastify_logging,
      /*
        ? {
            transport: {
              target: "@fastify/one-line-logger",
            },
          }
        : {},
         */
    });

    return web;
  }

  override run() {
    this.fastify
      .register(this.remixFastify, {
        getLoadContext(request: any, reply: any) {
          return { request, reply, ppc };
        },
      })
      .then(() => {
        this.fastify.listen(
          { port: this.ppc.config.port },
          (err: any, _address: any) => {
            if (err) {
              this.fastify.log.error(err);
              process.exit(1);
            }
          },
        );
      });
  }
}

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
    return await WebServer.create(ppc);
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
