
export function getPPCSingelton(): any {
  return (globalThis as any).ppc
}

export function setPPCSingelton(ppc: any) {
  (globalThis as any).ppc = ppc
}

export abstract class PartBase {
	[key: string]: any

	constructor () {}
	static async create(_ppc: PPC): Promise<PartBase> {
		throw "create not implemented by part"
	}

	abstract run (): void
}

export type PartSpec = string

export type OptionDefinition = {
	default_val: OptionValue | null
	env_var_name: string | null
}

export type OptionValue = string | number | boolean | object;

type Config = {
	[key: string]: any, 
	parts: PartSpec[],
	app_type: string,
}

export function createPPCApp(config_param: Config) {
	PPC.createPPCApp(config_param)
}

export function runPPCApp(config_param: Config) {
	PPC.createPPCApp(config_param).then( ppc => ppc.run())
}

export class PPC{
	[key: string]: any
	config: Config = {
		parts: [],
		app_type: "",
	}
	opts: {[key: string]: OptionDefinition} = {}

	static async createPPCApp(config_param: Config) {

		const ppc = new PPC();

		setPPCSingelton(ppc)

		ppc.config = config_param;
		ppc.part_names = [ "config" ]; // always include the config part

		// gather all config options from all parts
		ppc.opts = {};
		await Promise.all(ppc.config.parts.map((part_name) => ppc.addConfOpts(part_name)))

		// load config part
		const config_part = (await import("./config/index.js")).default
		Object.assign(ppc.config, await config_part.create(ppc))

		console.log("config:", ppc.config)
		// load all parts
		await Promise.all(ppc.config.parts.map((part_name) => ppc.loadPart(part_name)))
		console.log("web:", ppc.web)

		console.log("loaded parts: ", ppc.part_names.join(" "))

		return ppc
	}

	async getPartDefinition(part_name: PartSpec) {
		return (await import(`./${part_name}/index.js`)).default
	}

	async loadPart(part_name: string) {
		let part: any = await this.getPartDefinition(part_name)

		for (const dep_name of (part.deps ?? [])) {
			await this.loadPart(dep_name)
		}
		if ( !(part_name in this) ) {
			this[part_name] = await part.create(this);
			this.part_names.push(part_name);
		}
	}

	async addConfOpts(part_name: string) {
		const part = await this.getPartDefinition(part_name)

		for (const dep_name of part.deps ?? []) {
			await this.addConfOpts(dep_name)
		}

		for (const [key, value] of Object.entries(part.opts ?? {})) {
			if (!(key in this.opts)) {
				this.opts[key] = value as OptionDefinition
			}
		}
	}

	run () {
		for (const [part_name, obj] of Object.entries(this)) {
			if (obj instanceof PartBase) {
				console.log(`calling ${part_name}.run()`)
				obj.run()
			}
		}
	}
}




