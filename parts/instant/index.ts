import { init as initInstant, id } from "@instantdb/admin";

export async function init(ppc: PPC) {
  if (ppc.config.is_server) {
    return await serverInit(ppc);
  } else {
    return await clientInit(ppc);
  }
}

async function serverInit(ppc: PPC) {
  ppc.config.is;
  ppc.instant = initInstant({
    app_id: ppc.config.instant.app_id,
    apiURI: ppc.config.instant.apiURI,
    websocketURI: ppc.config.instant.apiURI,
  });

  /**
   * Instant Auth endpoint
   */
  ppc.web.fastify.get(
    "/auth/instant",
    { preHandler: auth.serverRequireAuth() },
    async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const session = reply.session;
      if (!session) {
        return reply.status(401).send({ error: "Unauthorized" });
      }
      const token = (session as any).accessToken;
      const instant_token = await ppc.instant.auth.createToken({
        email: token.email,
      });
      return reply
        .status(200)
        .header("Content-Type", "application/json")
        .send({ instant_token });
    },
  );
}

async function clientInit(ppc: PPC) {
  ppc.instant = init({
    app_id: ppc.config.instant.app_id,
    apiURI: ppc.config.instant.apiURI,
    websocketURI: ppc.config.instant.apiURI,
  });

  // authenticate
  const res = await fetch(ppc.config.host + "/auth/instant", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  console.log("auth data:", data);
}

export const opts = {
  "instant.app_id": {
    env_var_name: "PPC_INSTANT_APP_ID",
  },
  "instant.apiURI": {
    env_var_name: "PPC_INSTANT_API_URI",
  },
  "instant.websocketURI": {
    env_var_name: "PPC_INSTANT_WEBSOCKET_URI",
  },
};

export const deps = ["web", "auth"];
