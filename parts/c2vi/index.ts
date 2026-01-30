export const opts = {
  local_storage_path: {
    env_var_name: "PPC_LOCAL_STORAGE_PATH",
  },
};

export const deps = ["habitica"];

export async function init(ppc: PPC) {
  ppc.withPlatformSpecificPackage("./node.ts", async (node_stuff) => {
    await node_stuff.init(ppc);
  });
}
