import type { LoaderFunctionArgs } from "react-router";
import { signIn } from "https://deno.land/x/deno_kv_oauth@v0.10.0/mod.ts";
import { oauthConfig } from "~/utils/oauth2_client.server.ts";

export async function loader({ request }: LoaderFunctionArgs) {
  return await signIn(request, oauthConfig);
}

export default function SignIn() {
  return null;
}
