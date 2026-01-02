import { Form, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

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

export default function LoginPage() {
  const { csrfToken } = useLoaderData<typeof loader>();
  const actionUrl = `/auth/signin/zitadel?csrfToken=${csrfToken}`;
  return (
    <div>
      <h1>Login to PPC App</h1>
      <form id="loginForm" action={actionUrl} method="post">
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <button
          id="loginButton"
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2 mb-6 cursor-pointer"
        >
          LOGIN
        </button>
      </form>
    </div>
  );
}
