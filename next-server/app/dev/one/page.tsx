import {getPPCSingelton} from "@ppc/parts";

export default function DevPageOne() {
  const ppc = getPPCSingelton()
  return (
    "hello world, running as application: " + ppc.app_type
  );
}
