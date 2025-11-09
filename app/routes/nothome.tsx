import { Welcome } from "~/components/welcome.tsx";
import type { Route } from "./+types/nothome.ts";
import * as db from "~/components/db.tsx";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "art 🎨" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader() {
  const longUrl = 'https://fireship.io';
  const userId = 'test';
  const shortCode = await db.encodeShortCode(longUrl)

  console.log(shortCode)

  await db.storeShortLink(longUrl, shortCode, userId);
  
  const linkData = await db.getShortLink(shortCode)
  console.log(linkData)
  
  return {
    message: 'Hello, World!'
  };
}

export default function NotHome({ loaderData }: Route.ComponentProps) {
  return <Welcome message={loaderData.message} />;
}
