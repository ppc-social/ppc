import Fastify from "fastify"
import fastifyStatic from "@fastify/static"
import path from 'path';
import { PPC, PartBase } from "@ppc/parts"
//import React from 'react';
import ReactDOMServer from 'react-dom/server';
//import { StaticRouter } from 'react-router-dom/server';

class WebServer extends PartBase {
	[key: string]: any

	static async create (ppc: PPC): Promise<WebServer> {
		const web = new WebServer()
		web.ppc = ppc

		web.fastify = Fastify({
			logger: ppc.config.fastify_logging,
		})

		web.fastify.register(fastifyStatic, {
  				root: path.join(import.meta.dirname, '../../../browser-client/dist'),
  				prefix: '/browser-client/'
		});

		return web
	}
	
	addPage(path: string, component: any) {
		this.fastify.get(path, (req: any, reply: any) => {
		  	const appHtml = ReactDOMServer.renderToString(component);

			reply.type('text/html').send(`
				<!DOCTYPE html>
				<html>
				<head>
				  <title>PPC</title>
				  <script async type="module" data-part-names=${this.ppc.part_names.join(" ")} src="/browser-client/browser-client.es.js"></script>
				</head>
				<body>
				  <div id="root">${appHtml}</div>
				</body>
			 	</html>
			`)
		})

	}

	run () {
		console.log("hereeeeeeeeeeee")
		this.fastify.listen({ port: this.ppc.config.port }, (err: any, _address: any) => {
  			if (err) {
    			this.fastify.log.error(err)
    			process.exit(1)
  			}
		})
	}

}

class WebClient extends PartBase {
	[key: string]: any

	static async create (_ppc: PPC): Promise<WebClient> {
		const web = new WebClient()
		return web
	}

	run(): void {
		
	}
}

export default {
	create: async (ppc: PPC) => ppc.config.is_client ? WebClient.create(ppc) : WebServer.create(ppc),
	opts: {
		"port": {
			default_val: 3000,
		},
		"fastify_logging": {
			default_val: true,
		},
	},
}
