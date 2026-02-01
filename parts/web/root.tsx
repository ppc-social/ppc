import * as React from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
} from "@remix-run/react";

export const handle = { hydrate: false };

export function HydrateFallback() {
  return (
    <>
      <p>Hydrate failed</p>
      <Scripts />
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const matches = useMatches();
  // Check if any active route has disabled hydration
  const includeScripts = !matches.some(
    (match) => match.handle && (match.handle as any).hydrate === false,
  );

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        {includeScripts && <Scripts />}
      </body>
    </html>
  );
}

export default function PPCRemixApp() {
  console.log("PPCRemixApp logging smth");
  return <Outlet />;
}
