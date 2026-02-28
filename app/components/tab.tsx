import favicon from "/favicon.ico";
import { User } from "~/utils/db.tsx";

interface TabProps {
  tld: string;
  mainTab?: boolean;
  currentUser: User | null;
  onRemoveTab: (tld: string) => void
}

export default function Tab({ tld, mainTab, currentUser, onRemoveTab }: TabProps) {
  return mainTab ? (
      <div className="w-full min-w-0">
        <div className="w-full min-w-0 flex md:flex flex-row items-center p-4 rounded-xl border-2 border-black bg-white">
          <h1 className="flex flex-row items-center text-black text-xl font-bold">
            <a
              className="flex flex-row items-center"
              href="/"
              target="_blank"
            >
              <img
                src={favicon}
                alt="random.art"
                className="w-8 h-8"
              />
              <span className="text-black text-xl font-bold">andom.art</span>
            </a>
          </h1>
          <div className="ml-auto w-[1.5rem] text-blue-700 hover:underline dark:text-blue-500">
            {currentUser !== null ? (
              <>
                <a
                  className="text-blue-700 hover:underline dark:text-blue-500"
                  href="/signout"
                >
                  <img
                    src="/logout.svg"
                    alt="signout"
                    className="w-[1.5rem] max-w-none"
                  />
                </a>
              </>
            ) : (
              <>
              </>
            )}
          </div>
        </div>
      </div>
    ) : (
      <div className="w-full min-w-0">
        <div className="w-full min-w-0 flex items-center p-4 gap-2 rounded-xl border-2 border-black bg-white">
          <h1 className="flex-1 min-w-0">
            <a
              href={"https://" + tld}
              target="_blank"
              className="flex whitespace-nowrap overflow-x-auto pr-2 scrollbar-thin scrollbar-hide text-black text-xl font-bold"
            >
              {tld}
            </a>
          </h1>
          <div className="ml-auto flex items-center w-[1.5rem] ml-2 bg-white">
            <button type="button" onClick={() => onRemoveTab?.(tld)}>
              <img
                src="/x.svg"
                alt="close tab"
                className="w-[1.5rem] max-w-none"
              />
            </button>
          </div>
        </div>
      </div>
    );
}
