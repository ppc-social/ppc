import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getPPCSingelton } from "../index.ts";
export const handle = { hydrate: true };
import { Form } from "@remix-run/react";

export const loader = async ({ request }: any) => {
  // Use your actual base URL or environment variable
  const baseUrl = new URL(request.url).origin;

  const response = await fetch(`${baseUrl}/auth/csrf`, {
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
  });
  const cookieHeader = response.headers.get("set-cookie");

  const { csrfToken } = await response.json();

  return json(
    { csrfToken },
    {
      headers: cookieHeader ? { "Set-Cookie": cookieHeader } : {},
    },
  );
};

export default function MainPage() {
  const { csrfToken } = useLoaderData<typeof loader>();

  return (
    <center>
      <h2>"Cool People doing Cool things together"</h2>
      <p>
        Read what this is all about:{" "}
        <a href="https://wiki.ppc.social/u/c2vi/The-Idea-of-PPC">About</a>
      </p>

      <br></br>

      <p>
        <form id="loginForm" action="/auth/signin/zitadel" method="post">
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <button
            id="loginButton"
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2 mb-6 cursor-pointer"
          >
            LOGIN
          </button>
        </form>
      </p>

      <p>
        There is a Discord Server:{" "}
        <a href="https://discord.gg/cMKQNJMkRe">
          https://discord.gg/cMKQNJMkRe
        </a>
      </p>

      <p>
        There is a <a href="https://ppc.social/mc">Minecraft server</a>.
      </p>

      <p>
        There is <a href="https://wiki.ppc.social">The PPC Wiki Projekt</a>.
      </p>

      <p>
        There is an{" "}
        <a href="https://www.instagram.com/ppc.social/">Instagram</a> and a{" "}
        <a href="https://www.youtube.com/@ppc.social">Youtube Channel</a>
      </p>

      <p>and that's about all for now...</p>

      <footer>
        <a href="/impressum">impressum</a>
      </footer>
    </center>
  );
}

export function MainPageHydration(ppc: any) {
  console.log("MainPage client hydration yayyyyyyyyyyyyyy");
}
