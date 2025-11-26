import favicon from "/favicon.ico";

interface TabProps {
  mainTab?: boolean;
  tld: string;
}

export default function Tab({ mainTab, tld }: TabProps) {
  if (mainTab === true) {
    return (
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
    );
  }
  else {
    return (
      <div className="flex items-center p-4 rounded-xl border-2 border-black bg-white w-64">
        <h1 className="text-black text-xl font-bold">
          <a
            className="underline"
            href={"https://" + tld}
            target="_blank"
          >
            {tld}
          </a>
        </h1>
      </div>
    );
  }
}
