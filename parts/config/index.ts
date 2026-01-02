import { type PPC } from "../index.ts";

export async function create(ppc: PPC): Promise<{}> {
  const config: { [key: string]: any } = {};
  const old_config = ppc.config;

  config.is_server =
    old_config.app_type == "server" || old_config.app_type == "daemon";
  config.is_client =
    old_config.app_type == "browser" ||
    old_config.app_type == "obsidian_plugin" ||
    old_config.app_type == "cli";
  config.has_node_env =
    old_config.app_type == "server" || old_config.app_type == "cli";

  // apply default values
  for (const [opt_id, opt] of Object.entries(ppc.opts)) {
    if ("default_val" in opt) {
      setConfigVal(config, opt_id, opt.default_val!);
    }
  }

  // load .env file
  if (config.has_node_env) {
    (await import("dotenv")).config({
      path: (await import("path")).resolve(import.meta.dirname, "../../.env"),
    });
  }

  // read in env vars if we are running as a server type application
  if (config.has_node_env) {
    config.is_development = process.env.PPC_DEVELOP ? true : false;
    config.is_production = !config.is_development;
    for (const [opt_id, opt] of Object.entries(ppc.opts)) {
      if ("env_var_name" in opt) {
        if (process.env[opt.env_var_name!!] !== undefined) {
          setConfigVal(config, opt_id, process.env[opt.env_var_name!!]!);
        }
      }
    }
  }

  return config;
}

export const opts = {
  // config file to read in
  config_files: {
    env_var_name: "PPC_CONFIG_FILES",
  },
  url: {
    env_var_name: "PPC_URL",
  },
  is_development: {
    default_val: false,
  },
  is_production: {
    default_val: true,
  },
};

function setConfigVal(obj: any, opt_id: string, opt_val: any) {
  const parts = opt_id.split(".");
  let tmp = obj;
  while (parts.length > 1) {
    if (!(parts[0]! in obj)) {
      obj[parts[0]!] = {};
    }
    tmp = obj[parts[0]!];
    parts.shift();
  }
  tmp[parts[0]!] = opt_val;
}
