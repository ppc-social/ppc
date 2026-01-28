export const opts = {
  "habitica.api_url": {
    env_var_name: "PPC_HABITICA_API_URL",
    default_val: "https://habitica.com/api/v3",
  },
  "habitica.user_id": {
    env_var_name: "PPC_HABITICA_USER_ID",
  },
  "habitica.client_name": {
    default_val: "3544a0b8-d71a-46e0-9bb1-6ddbb2abcddb-PPC-Software",
  },
  "habitica.api_token": {
    env_var_name: "PPC_HABITICA_API_TOKEN",
  },
};

export async function init(ppc: PPC) {
  const habitica = {};
  ppc.habitica = habitica;

  ppc.habitica.get_tasks = async (type: string = "todos") => {
    return await ppc.habitica.api_request("GET", `tasks/user?type=${type}`);
  };

  ppc.habitica.delete_task = async (id: string) => {
    await ppc.habitica.api_request("DELETE", `tasks/${id}`);
  };

  ppc.habitica.api_request = async (
    method: string,
    path: string,
    extraHeaders: object,
    data: object,
  ) => {
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    const headers = Object.assign(
      {
        "Content-Type": "application/json",
        "x-api-user": ppc.config.habitica.user_id,
        "x-api-key": ppc.config.habitica.api_token,
        "x-client": ppc.config.habitica.client_name,
      },
      extraHeaders,
    );

    const response = await fetch(ppc.config.habitica.api_url + path, {
      method,
      headers,
      body: JSON.stringify(data),
    });

    await handleRateLimit(response);

    if (!response.ok) {
      console.log("request_url:", ppc.config.habitica.api_url + path);
      throw new Error(
        `Habitica API error: ${response.status} ${response.statusText}`,
      );
    }

    return (await response.json()).data;
  };
}

async function handleRateLimit(response) {
  const limit = response.headers.get("X-RateLimit-Limit") || "NONE";
  const remaining = parseInt(
    response.headers.get("X-RateLimit-Remaining") || "10",
    10,
  );
  const reset = response.headers.get("X-RateLimit-Reset");

  console.log(
    `RateLimit: ${limit} | Remaining: ${remaining} | Reset: ${reset}`,
  );

  if (remaining < 2 && reset) {
    const resetDate = new Date(reset);
    const now = new Date();
    const waitMs = resetDate.getTime() - now.getTime() + 1000;

    if (waitMs > 0) {
      console.log(
        `Waiting ${Math.round(waitMs / 1000)} secs for next rate limit window...`,
      );
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
}
