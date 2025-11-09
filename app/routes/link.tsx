// routes/link.tsx
import { useLoaderData } from "react-router";
import Link from "~/components/link.tsx";
import { getShortLink } from "~/components/db.tsx";
import favicon from "/favicon.ico";

// Use a route loader (React Router’s data API)
export async function loader({ params }: { params: { shortCode: string } }) {
  const { shortCode } = params;

  if (!shortCode) {
    throw new Response("Missing short code", { status: 400 });
  }

  const record = await getShortLink(shortCode);
  if (!record || !record.longUrl) {
    throw new Response("Short link not found", { status: 404 });
  }

  return record.longUrl;
}

export default function LinkRoute() {
  const url = useLoaderData() as string;
  return (
    <div className="w-full h-screen flex flex-row bg-white border-8 overflow-hidden">
      <div className="flex flex-col bg-white border-4 overflow-hidden">
        <div className="flex flex-row bg-white border-4 overflow-hidden">
          <div className="flex justify-between items-center p-4 rounded-xl border-2 border-black bg-white">
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
            <h1 className="text-black text-xl font-bold text-right">
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
        <div className="flex justify-between items-center p-4 rounded-xl border-2 border-black bg-white">
          <h1 className="text-black text-xl font-bold">
            <a
              className="underline"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {url}
            </a>
          </h1>
        </div>
      </div>
      <Link url={url} />;
    </div>
  );
}
