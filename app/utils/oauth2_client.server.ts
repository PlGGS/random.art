// app/utils/oauth2_client.server.ts
import {
  createGoogleOAuthConfig,
  createHelpers,
} from "https://deno.land/x/deno_kv_oauth@v0.10.0/mod.ts";

export const oauthConfig = createGoogleOAuthConfig({
  redirectUri: "http://localhost:3000/auth/callback", // must match Google console
  scope: [
    "openid",
    "email",
    "profile",
  ],
});

export const {
  signIn,
  handleCallback,
  getSessionId,
  signOut,
} = createHelpers(oauthConfig);
