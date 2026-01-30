import { PartBase, type PPC } from "../index.ts";
import type { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import fastifyCookie from "@fastify/cookie";
import formbody from "@fastify/formbody";
import { FastifyAuth, getSession } from "@mridang/fastify-auth";
import { authConfig, buildLogoutUrl } from "./auth-util.ts";
import getMessage from "./auth-message.ts";

export async function init(ppc: PPC) {
  ppc.auth = await AuthServer.create(ppc);
}

export default class AuthServer extends PartBase {
  [key: string]: any;

  serverRequireAuth() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const session = await getSession(request, authConfig(this.ppc));
        if (!session?.user) {
          const callbackUrl: string = encodeURIComponent(request.url);
          return reply.redirect(`/auth/signin?callbackUrl=${callbackUrl}`);
        }
        reply.session = session;
      } catch (err) {
        throw err as Error;
      }
    };
  }

  static override async create(ppc: PPC): Promise<PartBase> {
    const auth = new AuthServer();
    auth.ppc = ppc;
    auth.config = authConfig(ppc);
    const app = ppc.web.fastify;

    await app.register(fastifyCookie);
    await app.register(formbody);

    /**
     * Initiates the logout process by redirecting the user to the external Identity
     * Provider's (IdP) logout endpoint. This endpoint validates that the user has an
     * active session with a valid ID token, generates a cryptographically secure state
     * parameter for CSRF protection, and stores it in a secure HTTP-only cookie.
     *
     * The state parameter will be validated upon the user's return from the IdP to
     * ensure the logout callback is legitimate and not a forged request.
     *
     * @returns A redirect response to the IdP's logout URL on success, or a 400-error
     * response if no valid session exists. The response includes a secure state cookie
     * that will be validated in the logout callback.
     */
    app.post(
      "/auth/logout",
      async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
        const session = await getSession(request, authConfig(ppc));
        const idToken = (session as any).idToken;

        if (!idToken) {
          return reply
            .status(400)
            .send({ error: "No valid session or ID token found" });
        }

        const { url, state } = await buildLogoutUrl(ppc, idToken);
        reply.setCookie("logout_state", state, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/auth/logout/callback",
        });
        return reply.redirect(url);
      },
    );

    /**
     * Handles the callback from an external Identity Provider (IdP) after a user
     * signs out. This endpoint is responsible for validating the logout request to
     * prevent Cross-Site Request Forgery (CSRF) attacks by comparing a `state`
     * parameter from the URL with a value stored in a secure, server-side cookie.
     * If validation is successful, it clears the user's session cookies and
     * redirects to a success page. Otherwise, it redirects to an error page.
     *
     * @param request - The Fastify request object, which contains the request functionality.
     * @param reply - The Fastify reply object, which contains the response functionality.
     * @returns A Response object that either redirects the user to a success
     * or error page. Upon success, it includes headers to delete session cookies.
     */
    app.get(
      "/auth/logout/callback",
      async (
        request: FastifyRequest<{ Querystring: QueryString }>,
        reply: FastifyReply,
      ): Promise<void> => {
        const state: string | undefined = request.query.state;
        const logoutStateCookie: string | undefined =
          request.cookies["logout_state"];

        if (state && logoutStateCookie && state === logoutStateCookie) {
          reply.header("Clear-Site-Data", '"cookies"');
          return reply.redirect("/auth/logout/success");
        } else {
          const reason: string = encodeURIComponent(
            "Invalid or missing state parameter.",
          );
          return reply.redirect(`/auth/logout/error?reason=${reason}`);
        }
      },
    );

    /**
     * GET /auth/login
     *
     * Renders a custom sign-in page that displays available authentication providers
     * and handles authentication errors with user-friendly messaging. This page is
     * shown when users need to authenticate, either by visiting directly or after
     * being redirected from protected routes via the requireAuth middleware.
     *
     * The sign-in page provides a branded authentication experience that matches the
     * application's design system, rather than using Auth.js default pages. It
     * supports error display, callback URL preservation, and CSRF protection via
     * client-side JavaScript.
     *
     * Authentication flow:
     * 1. User visits protected route without session
     * 2. requireAuth redirects to /auth/login?callbackUrl=<original-url>
     * 3. This route renders custom sign-in page with available providers
     * 4. User selects provider, CSRF token is fetched and added via JavaScript
     * 5. Form submits to /auth/signin/[provider] to initiate OAuth flow
     * 6. After successful authentication, user is redirected to callbackUrl
     *
     * Error handling supports all Auth.js error types including AccessDenied,
     * Configuration, OAuthCallback, and others, displaying contextual messages
     * via the getMessage utility function.
     *
     * The page specifically looks for the 'zitadel' provider to match the original
     * implementation behavior, showing only that provider's sign-in option even
     * if multiple providers are configured.
     *
     * @param request - Fastify Request object containing query parameters:
     *              - callbackUrl: URL to redirect after successful authentication
     *              - error: Auth.js error code for display (optional)
     * @param reply - Fastify Reply object
     */
    /**
     * GET /auth/signin
     *
     * Renders a custom sign-in page that displays available authentication providers
     * and handles authentication errors with user-friendly messaging. This page is
     * shown when users need to authenticate, either by visiting directly or after
     * being redirected from protected routes via the requireAuth middleware.
     *
     * The sign-in page provides a branded authentication experience that matches the
     * application's design system, rather than using Auth.js default pages. It
     * supports error display, callback URL preservation, and CSRF protection via
     * client-side JavaScript.
     *
     * Authentication flow:
     * 1. User visits protected route without session
     * 2. requireAuth redirects to /auth/login?callbackUrl=<original-url>
     * 3. This route renders custom sign-in page with available providers
     * 4. User selects provider, CSRF token is fetched and added via JavaScript
     * 5. Form submits to /auth/signin/[provider] to initiate OAuth flow
     * 6. After successful authentication, user is redirected to callbackUrl
     *
     * Error handling supports all Auth.js error types including AccessDenied,
     * Configuration, OAuthCallback, and others, displaying contextual messages
     * via the getMessage utility function.
     *
     * The page specifically looks for the 'zitadel' provider to match the original
     * implementation behavior, showing only that provider's sign-in option even
     * if multiple providers are configured.
     *
     * @param request - Fastify Request object containing query parameters:
     *              - callbackUrl: URL to redirect after successful authentication
     *              - error: Auth.js error code for display (optional)
     * @param reply - Fastify Reply object
     */
    app.get(
      "/auth/login",
      async (
        request: FastifyRequest<{ Querystring: QueryString }>,
        reply: FastifyReply,
      ) => {
        const callbackUrl = request.query.callbackUrl;
        const error = request.query.error;

        const providers: Provider[] = authConfig(ppc).providers.map(
          (provider) => {
            const config =
              typeof provider === "function" ? provider() : provider;
            return {
              id: config.id,
              name: config.name,
              signinUrl: `/auth/signin/${config.id}`,
            };
          },
        );

        return reply
          .type("text/html")
          .send(
            "login page... <a href='/auth/signin/zitadel'>login with Zitadel</a>",
          );
      },
    );

    /**
     * GET /auth/error
     *
     * Intercepts authentication-related errors (e.g., AccessDenied, Configuration,
     * Verification) from sign-in or callback flows and shows a friendly error page.
     *
     * @param request  - The Fastify request. May have `request.query.error` set to an
     *             error code string.
     * @param reply - Fastify Reply object
     */
    app.get(
      "/auth/error",
      (
        request: FastifyRequest<{ Querystring: QueryString }>,
        reply: FastifyReply,
      ) => {
        const error = request.query.error;
        const { heading, message } = getMessage(error, "auth-error");
        return reply.send("auth/error page");
      },
    );

    /**
     * ZITADEL UserInfo endpoint
     *
     * Fetches extended user information from ZITADEL's UserInfo endpoint using the
     * current session's access token. Provides real-time user data including roles,
     * custom attributes, and organization membership that may not be in the cached session.
     *
     * @param request - Fastify Request object
     * @param reply - Fastify Reply object
     */
    app.get(
      "/auth/userinfo",
      { preHandler: auth.serverRequireAuth() },
      async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
        const session = reply.session;
        if (!session) {
          return reply.status(401).send({ error: "Unauthorized" });
        }
        const token = (session as any).accessToken;
        if (!token) {
          return reply.status(401).send({ error: "No access token available" });
        }
        try {
          const idpRes = await fetch(
            `${ppc.config.zitadel.domain}/oidc/v1/userinfo`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (!idpRes.ok) {
            return reply
              .status(idpRes.status)
              .header("Content-Type", "application/json")
              .send({ error: `UserInfo API error: ${idpRes.status}` });
          }
          const userInfo = await idpRes.json();
          return reply.send(userInfo);
        } catch (err) {
          console.error("UserInfo fetch failed:", err);
          return reply.status(500).send({ error: "Failed to fetch user info" });
        }
      },
    );

    app.get(
      "/auth/logout/success",
      (_request: FastifyRequest, reply: FastifyReply) => {
        return reply.send("logout success");
      },
    );

    app.get(
      "/auth/logout/error",
      (
        request: FastifyRequest<{ Querystring: QueryString }>,
        reply: FastifyReply,
      ) => {
        const reason = request.query.reason ?? "An unknown error occurred.";
        return reply.send("logout error: " + reason);
      },
    );

    // done after other /auth routes!!
    await app.register(FastifyAuth(authConfig(ppc)), {
      prefix: "/auth",
    });

    app.get(
      "/profile",
      { preHandler: auth.serverRequireAuth() },
      async (_request: FastifyRequest, reply: FastifyReply) => {
        const session = reply.session;
        return reply.send("profile: " + JSON.stringify(session, null, 2));
      },
    );

    return auth;
  }
}

interface QueryString {
  callbackUrl?: string;
  error?: string;
  state?: string;
  reason?: string;
}

interface Provider {
  id: string;
  name: string;
  signinUrl: string;
}
