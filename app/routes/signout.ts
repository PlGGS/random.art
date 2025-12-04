import type { LoaderFunctionArgs } from "react-router";
import { deleteCurrentSession } from "~/utils/db.tsx";

function redirect(location: string, headers: HeadersInit = {}) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      ...headers,
    },
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const headers = new Headers();

  const sessionId = await deleteCurrentSession(request)

  if (sessionId)
    console.log("Deleted current session from db");

  headers.append(
    "Set-Cookie",
    [
      "session=;",
      "Path=/;",
      "HttpOnly;",
      "SameSite=Lax;",
      "Max-Age=0;",
    ].join(" "),
  );
  console.log("Cleared session cookie");

  return redirect("/", headers);
}

export default function SignOut() {
  return null;
}
