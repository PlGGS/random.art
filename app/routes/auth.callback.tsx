import type { LoaderFunctionArgs } from "react-router";
import { handleCallback } from "~/utils/oauth2_client.server.ts";
import {
  storeUserByEmailAddress,
  storeSession,
  type User,
} from "~/utils/db.tsx";

type GoogleUserInfo = {
  email?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

function redirect(location: string, extraHeaders: HeadersInit = {}) {
  const headers = new Headers(extraHeaders);
  headers.set("Location", location);

  return new Response(null, {
    status: 302,
    headers,
  });
}


export async function loader({ request }: LoaderFunctionArgs) {
  console.log("auth.callback: loader started");

  try {
    const { sessionId, tokens } = await handleCallback(request);
    console.log("auth.callback: handleCallback returned", { sessionId, tokens });

    if (!tokens.accessToken) {
      console.error("auth.callback: no accessToken on tokens", tokens);
      return redirect("/");
    }

    // Call Google userinfo endpoint with the access token
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    if (!res.ok) {
      console.error(
        "auth.callback: userinfo request failed",
        res.status,
        await res.text(),
      );
      return redirect("/");
    }

    const profile = (await res.json()) as GoogleUserInfo;
    console.log("auth.callback: userinfo profile", profile);

    if (!profile.email) {
      console.error("auth.callback: profile has no email");
      return redirect("/");
    }

    const emailAddress = profile.email;
    const firstName = profile.given_name ?? "";
    const lastName = profile.family_name ?? "";
    const avatar_url = profile.picture ?? "";

    const userData: User = {
      emailAddress,
      firstName,
      lastName,
      avatar_url,
    };

    console.log("auth.callback: storing user + session");
    console.log("auth.callback: sessionId: " + sessionId)

    await storeUserByEmailAddress(emailAddress, userData);
    await storeSession(sessionId, emailAddress);

    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      [
        `session=${sessionId};`,
        "Path=/;",
        "HttpOnly;",
        "SameSite=Lax;",
        // add "; Secure" in prod over HTTPS
      ].join(" "),
    );

    console.log("auth.callback: redirecting home with headers");
    return redirect("/", headers);
  } catch (err) {
    console.error("auth.callback: error", err);
    return new Response("OAuth callback failed", { status: 500 });
  }
}

export default function AuthCallback() {
  return null;
}
