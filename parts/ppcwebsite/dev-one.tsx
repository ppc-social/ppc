import { redirect } from "@remix-run/server-runtime";
import { getPPCSession } from "../auth/index.ts";

export const loader = async ({ context }: any) => {
  const user = await getPPCSession(context);
  if (!user) {
    return redirect("/login");
  }
  return null;
};

export default function DevOnePage() {
  return (
    <div>
      <h1>Dev One Page</h1>
    </div>
  );
}

export const clientLoader = async ({ context }: any) => {
  console.log("clientLoader of dev_one page");
};
