import path from "path";
import fs from "fs";

export function getPPCSingelton(config = {}): any {
  return (globalThis as any).ppc;
}

export function setPPCSingelton(ppc: any) {
  console.log("setPPCSingelton", ppc);
  (globalThis as any).ppc = ppc;
}

export abstract class PartBase {
  [key: string]: any;

  isPPCPart = true;

  constructor() {}
  static async create(_ppc: PPC): Promise<PartBase> {
    throw "create not implemented by part";
  }

  run(): void {}
}

export type PartSpec = string;

export type OptionDefinition = {
  default_val: OptionValue | null;
  env_var_name: string | null;
};

export type OptionValue = string | number | boolean | object;

type Config = {
  [key: string]: any;
  parts: PartSpec[];
  app_type: string;
};

export async function createPPCApp(config_param: Config) {
  console.log("createPPCApp config_only:", config_param.config_only ?? false);
  const ppc = new PPC();

  ppc.config = config_param;

  if (!ppc.config.config_only) {
    setPPCSingelton(ppc);
  }

  // always include the config part
  ppc.config.part_names = ["config"];

  // gather all config options from all parts
  ppc.opts = {};
  await Promise.all(
    ppc.config.parts.map((part_name) => ppc.addConfOpts(part_name)),
  );
  //console.log("final opts:", ppc.opts)

  // load config part
  const config_part = await import("./config/index.js");
  Object.assign(ppc.config, await config_part.create(ppc));
  //console.log("final config:", ppc.config)

  if (ppc.config.config_only) {
    // dont load any other parts if set to config only
    return ppc;
  }

  // load all parts
  //await Promise.all(ppc.config.parts.map((part_name) => ppc.loadPart(part_name)))
  for (const part_name of ppc.config.parts) {
    await ppc.loadPart(part_name);
  }

  console.log("loaded parts: ", ppc.config.part_names.join(" "));

  console.log("singelton...", getPPCSingelton().ppcwebsite);

  return ppc;
}

export function runPPCApp(config_param: Config) {
  console.log("runPPCApp.....");
  createPPCApp(config_param).then((ppc) => ppc.run());
}

export class PPC {
  [key: string]: any;
  config: Config = {
    parts: [],
    app_type: "",
  };
  opts: { [key: string]: OptionDefinition } = {};

  async getPartDefinition(part_name: PartSpec) {
    let part = null;
    if (fs.existsSync(`${import.meta.dirname}/${part_name}/index.ts`)) {
      part = await import(`${import.meta.dirname}/${part_name}/index.ts`);
    } else {
      part = await import(`${import.meta.dirname}/${part_name}.js`);
    }

    //console.log("part def:", part_name, part);
    return part;
  }

  async loadPart(part_name: string) {
    let part: any = await this.getPartDefinition(part_name);
    //console.log("part_name:", part_name)
    //console.log("part:", part)
    //console.log("ppc before:", this)

    for (const dep_name of part.deps ?? []) {
      await this.loadPart(dep_name);
    }
    if (!(part_name in this)) {
      // old create fn
      if ("create" in part && typeof part.create === "function") {
        this[part_name] = await part.create(this);
      }

      // new init fn
      if ("init" in part && typeof part.init === "function") {
        await part.init(this);
      }
    }
  }

  async addConfOpts(part_name: string) {
    const part = await this.getPartDefinition(part_name);

    for (const dep_name of part.deps ?? []) {
      await this.addConfOpts(dep_name);
    }

    if (!this.config.part_names.includes(part_name)) {
      this.config.part_names.push(part_name);
    }

    for (const [key, value] of Object.entries(part.opts ?? {})) {
      if (!(key in this.opts)) {
        this.opts[key] = value as OptionDefinition;
      }
    }
  }

  run() {
    for (const [part_name, obj] of Object.entries(this)) {
      if (obj && "isPPCPart" in obj && "run" in obj) {
        console.log(`calling ${part_name}.run()`);
        obj.run();
      }
    }
  }
}
