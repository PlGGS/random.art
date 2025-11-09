// components/link.tsx
interface LinkProps {
  url: string;
}

export default function Link({ url }: LinkProps) {
  return (
    <div className="flex-1 border-4 overflow-hidden">
        <div className="w-full h-full rounded-xl border-2 border-black overflow-hidden">
        <iframe
            src={url}
            className="w-full h-full"
            title="External Site"
        />
        </div>
    </div>
  );
}
