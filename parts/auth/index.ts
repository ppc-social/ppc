import { getSession } from "@mridang/fastify-auth";
import { getPPCSingelton, type PPC } from "../index.ts";
import AuthClient from "./client.ts";

export async function getPPCSession(context: any) {
  const ppc = getPPCSingelton();
  const fastifyReq = context.request;
  const sessionData = await getSession(fastifyReq, ppc.auth.config);
  return sessionData;
}

export async function remix_routes(defineRoutes: any, ppc: PPC) {
  return defineRoutes((route: any) => {
    if (!ppc.config.isSPA) {
      route("/", "../auth/login_page.tsx", { index: true });
    }
  });
}

export async function init(ppc: PPC) {
  if (ppc.config.is_server) {
    ppc.subInit("./server.ts");
  } else {
    ppc.auth = await AuthClient.create(ppc);
  }
}

export const deps = ["web"];

export const opts = {
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
    default_val:
      "openid profile email offline_access urn:zitadel:iam:user:metadata urn:zitadel:iam:user:resourceowner urn:zitadel:iam:org:projects:roles",
  },

  "auth.session_duration": {
    default_val: 3600,
    env_var_name: "PPC_AUTH_SESSION_DURATION",
  },

  "auth.session_secret": {
    env_var_name: "PPC_AUTH_SESSION_SECRET",
  },
};
