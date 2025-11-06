/// <reference lib="deno.unstable" />

import { serveFile } from "@std/http/file-server";
import { join } from "@std/path/join";
import { createRequestHandler } from "react-router";

const handleRequest = createRequestHandler(
  await import(`./build/server/index.js?t=${Date.now()}`),
  "development",
);

Deno.serve({ port: 3000 }, async (request) => {
  const pathname = new URL(request.url).pathname;

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
