import { Welcome } from "~/components/welcome.tsx";
import type { Route } from "./+types/home.ts";
import * as db from "~/components/db.tsx";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "art 🎨" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader() {
  const longUrl = 'https://fireship.io';
  const shortCode = await db.generateShortCode(longUrl)
  const userId = 'test';

  console.log(shortCode)

  await db.storeShortLink(longUrl, shortCode, userId);
  
  const linkData = await db.getShortLink(shortCode)
  console.log(linkData)

  return {
    message: `Hello from Deno ${
      Deno.version.deno ? `v${Deno.version.deno}` : "Deploy"
    }`,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Welcome message={loaderData.message} />;
}
