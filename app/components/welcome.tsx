import favicon from "/favicon.ico";

export function Welcome({ message }: { message: string }) {
  return (
    <main className="flex items-center justify-center pt-10 pb-4">
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
              {resources.map(({ href, text, icon }) => (
                <li key={href}>
                  <a
                    className="underline group flex items-center gap-3 self-stretch p-3 leading-normal text-blue-700 hover:underline dark:text-blue-500"
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {icon}
                    {text}
                  </a>
                </li>
              ))}
              <li className="self-stretch p-3 text-gray-900 dark:text-gray-200 leading-normal">{message}</li>
            </ul>
          </nav>
        </div>
        <div>
          <img
            src="/doubledown.svg"
            alt="down button"
            className="h-16 w-16 full"
          />
        </div>
      </div>
    </main>
  );
}

const resources = [
  {
    href: "https://reactrouter.com/docs",
    text: "Login",
    icon: (
      <img
        src="/login.svg"
        alt="login"
        className="h-6 w-6 full"
      />
    ),
  },
  {
    href: "https://rmx.as/discord",
    text: "Sign up",
    icon: (
      <img
        src="/signup.svg"
        alt="sign up"
        className="h-6 w-6 full"
      />
    ),
  },
];
