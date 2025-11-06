import { Welcome } from "~/components/welcome.tsx";
import type { Route } from "./+types/nothome.ts";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "art 🎨" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export function loader() {
  return {
    message: 'Hello, World!'
  };
}

export default function NotHome({ loaderData }: Route.ComponentProps) {
  return <Welcome message={loaderData.message} />;
}
