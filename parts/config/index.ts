
import {VicConfigPart, VicConfigValue} from "./vic-config-part"
import ZITADEL_SCOPES from "./zitadel-scopes"

export class Config extends VicConfigPart {
  constructor (ppc: any) {
    super()
    this.ppc = ppc

    this.is_server = ppc.app_type == "server" || ppc.app_type == "daemon"
    this.is_client = ppc.app_type == "browser" || ppc.app_type == "obsidian_plugin" || ppc.app_type == "cli"
    this.has_node_env = ppc.app_type == "server" || ppc.app_type == "cli"

    // apply default values
    for (const [opt_id, opt] of Object.entries(options)) {
      if ("default_val" in opt) {
        setConfigVal(this, opt_id, opt.default_val!)
      }
    }

    // read in env vars if we are running as a server type application
    if (this.has_node_env) {
      for (const [opt_id, opt] of Object.entries(options)) {
        if ("env_var_name" in opt) {
          if (process.env[opt.env_var_name] !== undefined) {
            setConfigVal(this, opt_id, process.env[opt.env_var_name]!)
          }
        }
      }
    }

    // read config file
    // TODO in the future
    //if (options.config_files.val ==)

  }
}

function setConfigVal(obj: any, opt_id: string, opt_val: VicConfigValue) {
  const parts = opt_id.split(".")
  let tmp = obj
  while (parts.length > 1) {
    if (! (parts[0] in obj)) {
      obj[parts[0]] = {}
    }
    tmp = obj[parts[0]]
    parts.shift()
  }
  tmp[parts[0]] = opt_val
}

const options = {
  // config file to read in
  "config_files": {
    env_var_name: "PPC_CONFIG_FILES",
  },

  "url": {
    env_var_name: "PPC_URL",
  },

  "zitadel.client_id": {
    env_var_name: "PPC_ZITADEL_CLIENT_ID",
  },

  "zitadel.client_secret": {
    env_var_name: "PPC_ZITADEL_CLIENT_SECRET",
  },

  "zitadel.domain": {
    env_var_name: "PPC_ZITADEL_DOMAIN",
  },

  "zitadel.post_logout_url": {
    env_var_name: "PPC_ZITADEL_POST_LOGOUT_URL",
  },

  "zitadel.scopes": {
    default_val: ZITADEL_SCOPES.next_server
  },

  "auth.session_duration": {
    default_val: 3600,
    env_var_name: "PPC_AUTH_SESSION_DURATION",
  },

  "auth.session_secret": {
    env_var_name: "PPC_AUTH_SESSION_SECRET",
  },
  "is_development": {
    default_val: false,
  },
  "is_production": {
    default_val: true,
  },
};



