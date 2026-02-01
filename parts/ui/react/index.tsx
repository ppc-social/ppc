// React component lib of PPC-soft
import { Link as RemixLink } from "@remix-run/react";
import { Link as ReactLink } from "react-router-dom";

export function Link(props) {
  return ppc.isRemix ? <RemixLink {...props} /> : <ReactLink {...props} />;
}
