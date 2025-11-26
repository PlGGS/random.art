/// <reference lib="deno.unstable" />

import { serveFile } from "@std/http/file-server";
import { join } from "@std/path/join";
import { createRequestHandler } from "react-router";

const handleRequest = createRequestHandler(
  await import(`./build/server/index.js?t=${Date.now()}`),
  "development",
);

type EmbedMode = "iframe" | "external";

async function checkEmbedHandler(request: Request): Promise<Response> {
  const { url } = await request.json().catch(() => ({ url: "" as string }));

  let target: URL;
  try {
    target = new URL(url);
    if (target.protocol !== "http:" && target.protocol !== "https:") {
      throw new Error("Invalid protocol");
    }
  } catch {
    return new Response(
      JSON.stringify({ mode: "external" as EmbedMode, reason: "invalid-url" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }

  try {
    // Try HEAD first (cheaper)
    let res = await fetch(target.toString(), {
      method: "HEAD",
      redirect: "follow",
    });

    // Fallback to GET
    if (!res.ok || res.status >= 400) {
      res = await fetch(target.toString(), {
        method: "GET",
        redirect: "follow",
      });
    }

    const mode = detectEmbedMode(target, res.headers);

    return new Response(
      JSON.stringify({ mode }),
      { headers: { "content-type": "application/json" } },
    );
  } catch {
    // Network/DNS/etc... treat as non-embeddable
    return new Response(
      JSON.stringify({ mode: "external" as EmbedMode, reason: "network-error" }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }
}

function detectEmbedMode(_url: URL, headers: Headers): EmbedMode {
  const xfo = headers.get("x-frame-options");
  if (xfo) {
    return "external";
  }

  const csp = headers.get("content-security-policy");
  if (csp) {
    const lower = csp.toLowerCase();
    if (lower.includes("frame-ancestors")) {
      if (lower.includes("frame-ancestors 'none'")) {
        return "external";
      }
      if (lower.includes("frame-ancestors 'self'")) {
        return "external";
      }
    }
  }

  // Try to iframe if nothing explicitly says no
  return "iframe";
}

Deno.serve({ port: 3000 }, async (request) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname === "/api/check-embed" && request.method === "POST") {
    return await checkEmbedHandler(request);
  }

  try {
    const filePath = join("./build/client", pathname);
    const fileInfo = await Deno.stat(filePath);

    if (fileInfo.isDirectory) {
      throw new Deno.errors.NotFound();
    }

    const response = await serveFile(request, filePath, { fileInfo });

    // disable aggressive caching in dev
    response.headers.set("cache-control", "no-store");

    return response;
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
  }

  return handleRequest(request);
});
