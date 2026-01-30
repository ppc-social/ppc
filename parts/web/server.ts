import Fastify from "fastify";
import sourceMapSupport from "source-map-support";
import { remixFastify } from "@mcansh/remix-fastify";

export default class WebServer extends PartBase {
  [key: string]: any;
  routes: any[] = [];

  static override async create(ppc: PPC): Promise<WebServer> {
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
      .register(remixFastify, {
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
