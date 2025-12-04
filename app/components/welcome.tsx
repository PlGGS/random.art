import type { User } from "~/utils/db.tsx";

type WelcomeProps = {
  onAddTab: (tld: string) => void;
  currentUser: User | null;
};

export function Welcome({ onAddTab, currentUser }: WelcomeProps) {
  return (
    <main className="flex items-center justify-center pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <div className="max-w-[100vw] p-4">
            <img
              src="/letter-r.svg"
              alt="random.art"
              className="h-64 w-64 full"
            />
            <p className="text-4xl font-bold text-black rotate-90 pl-25 tracking-widest select-none">
              andom
            </p>
          </div>
        </header>

        <div className="max-w-[300px] pt-8 w-full space-y-6 px-4">
          <nav className="rounded-3xl border border-gray-700 p-6 dark:border-gray-200 space-y-4">
            <p className="leading-6 text-gray-900 dark:text-gray-200 text-center">
              Welcome!
            </p>
            <ul>
              {currentUser ? (
                <li className="self-stretch p-3 text-gray-900 dark:text-gray-200 leading-normal">
                  Hello, {currentUser.firstName} {currentUser.lastName} (
                  {currentUser.emailAddress})
                </li>
              ) : (
                <li className="self-stretch p-3 leading-normal">
                  <a
                    className="underline group flex items-center gap-3 self-stretch leading-normal text-blue-700 hover:underline dark:text-blue-500"
                    href="/signin"
                  >
                    <img
                      src="/login.svg"
                      alt="signin"
                      className="h-6 w-6 full"
                    />
                    Login / Sign up
                  </a>
                </li>
              )}
              <li className="self-stretch p-3 text-gray-900 dark:text-gray-200 leading-normal">
                Or click to get started! ↓
              </li>
            </ul>
          </nav>
        </div>

        <div>
          <button type="button" onClick={() => onAddTab?.("blakeboris.com")}>
            <img
              src="/doubledown.svg"
              alt="down button"
              className="h-16 w-16 full"
            />
          </button>
        </div>
      </div>
    </main>
  );
}
