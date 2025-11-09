import { Welcome } from "~/components/welcome.tsx";
import type { Route } from "./+types/home.ts";
import favicon from "/favicon.ico";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "art 🎨" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export function loader() {
  return {
    message: `Hello from Deno ${
      Deno.version.deno ? `v${Deno.version.deno}` : "Deploy"
    }`,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div className="w-full h-screen flex flex-row bg-white border-8 overflow-hidden">
      <div className="flex flex-col bg-white border-4 overflow-hidden">
        <div className="flex flex-row bg-white border-4 overflow-hidden">
          <div className="flex items-center p-4 rounded-xl border-2 border-black bg-white w-64">
            <h1 className="text-black text-xl font-bold">
              <a
                className="underline"
                href="/"
                target="_blank"
              >
                <img
                  src={favicon}
                  alt="random.art"
                  className="w-8 h-8"
                />
              </a>
            </h1>
            <h1 className="text-black text-xl font-bold">
              <a
                className="underline"
                href="/"
                target="_blank"
              >
                andom.art
              </a>
            </h1>
          </div>
        </div>
      </div>
      <div className="flex-1 border-4 overflow-hidden">
        <Welcome message={loaderData.message} />;
      </div>
    </div>
  );
  
  
}
