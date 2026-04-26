import { useState, useRef, useEffect, useMemo } from "react";
import type { Route } from "./+types/home.ts";
import { Welcome } from "~/components/welcome.tsx";
import Tab from "../components/tab.tsx";
import { User, getCurrentUser } from "~/utils/db.tsx";

type LoaderData = {
  currentUser: User | null
}

type TabMode = "fixed" | "iframe" | "external";
type TabType = {
  tld: string;
  mainTab?: boolean;
  currentUser: User | null;
  mode: TabMode;
  onRemoveTab: (tld: string) => void
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "art 🎨" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
  const currentUser = await getCurrentUser(request);

  console.log("home.loader currentUser: ", currentUser); 

  return {
    currentUser
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { currentUser } = loaderData as unknown as LoaderData;

  const fixedFirstTab: TabType = { tld: "random.art", mode: "fixed", mainTab: true, currentUser, onRemoveTab: removeTab};
  const [dynamicTabs, setDynamicTabs] = useState<TabType[]>([]);
  const tabs = useMemo(
    () => [fixedFirstTab, ...dynamicTabs],
    [fixedFirstTab, dynamicTabs],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoScrollIndex, setAutoScrollIndex] = useState<number | null>(null);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  async function addTab(tld: string) {
    const url = `https://${tld}`;

    try {
      const res = await fetch("/api/check-embed", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });

      let mode: TabMode = "external";
      if (res.ok) {
        const data = await res.json();
        mode = data.mode;
      }

      const newTab: TabType = { tld, mode, currentUser, onRemoveTab: removeTab };

      setDynamicTabs((prev) => {
        const newDynamic = [...prev, newTab];

        // index 0 is fixedFirstTab
        const newIndex = newDynamic.length;

        setCurrentIndex(newIndex);
        setAutoScrollIndex(newIndex);

        return newDynamic;
      });
    } catch {
      const newTab: TabType = { tld, mode: "external", currentUser, onRemoveTab: removeTab };
      setDynamicTabs((prev) => [...prev, newTab]);
    }
  }

  function removeTab(tld: string) {
    if (tld === fixedFirstTab.tld) return;

    setDynamicTabs((prev) => {
      const removedDynamicIndex = prev.findIndex((t) => t.tld === tld);
      if (removedDynamicIndex === -1) return prev;

      const newDynamicTabs = prev.filter((t) => t.tld !== tld);

      // dynamic index -> tabs index (tabs = [fixed, ...dynamic])
      const removedTabIndex = removedDynamicIndex + 1;

      setCurrentIndex((cur) => {
        let nextIndex = cur;

        if (cur > removedTabIndex) {
          // Removed something before current -> shift left
          nextIndex = cur - 1;
        } else if (cur === removedTabIndex) {
          // Removed the current tab -> KEEP SAME INDEX
          // so the "next tab" slides into this slot
          nextIndex = cur;
        } else {
          // Removed after current -> no change
          nextIndex = cur;
        }

        // Clamp to last valid index after removal
        const newTabsLength = 1 + newDynamicTabs.length; // fixed + dynamic
        nextIndex = Math.min(Math.max(nextIndex, 0), newTabsLength - 1);

        setAutoScrollIndex(nextIndex);
        return nextIndex;
      });

      return newDynamicTabs;
    });
  }

  // Measure the height of the right-hand panel
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateHeight = () => {
      setPanelHeight(el.clientHeight);
    };

    updateHeight();
    globalThis.addEventListener("resize", updateHeight);
    return () => globalThis.removeEventListener("resize", updateHeight);
  }, []);

  // Update currentIndex based on scroll position
  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    if (!panelHeight) return;
    const scrollTop = e.currentTarget.scrollTop;
    const index = Math.round(scrollTop / panelHeight);
    const clamped = Math.min(Math.max(index, 0), tabs.length - 1);
    if (clamped !== currentIndex) {
      setCurrentIndex(clamped);
    }
  }

  useEffect(() => {
    if (
      autoScrollIndex !== null &&
      panelHeight !== null &&
      scrollRef.current
    ) {
      scrollRef.current.scrollTo({
        top: autoScrollIndex * panelHeight,
        behavior: "smooth",
      });

      // Clear it so normal user scrolling isn't overridden
      setAutoScrollIndex(null);
    }
  }, [autoScrollIndex, panelHeight, tabs.length]);

  const prevIndex = currentIndex > 0 ? currentIndex - 1 : null;
  const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : null;

  const startIndex = prevIndex ?? currentIndex;
  const endIndex = nextIndex ?? currentIndex;

  const beforeCount = startIndex;
  const afterCount = tabs.length - endIndex - 1;

  const MIN_SIDEBAR = 220;
  const MAX_SIDEBAR = 520;

  const [sidebarWidth, setSidebarWidth] = useState(320);

  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      if (!isResizingRef.current) return;

      const dx = e.clientX - startXRef.current;
      const next = startWidthRef.current + dx;

      const clamped = Math.max(MIN_SIDEBAR, Math.min(MAX_SIDEBAR, next));
      setSidebarWidth(clamped);

      // Prevent text selection / weird drag behaviors while resizing
      e.preventDefault();
    }

    function onPointerUp() {
      if (!isResizingRef.current) return;
      isResizingRef.current = false;

      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    globalThis.addEventListener("pointermove", onPointerMove);
    globalThis.addEventListener("pointerup", onPointerUp);

    return () => {
      globalThis.removeEventListener("pointermove", onPointerMove);
      globalThis.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  return (
    <div className="w-full h-screen flex flex-row bg-white p-2 overflow-hidden">
      <div
        className="relative flex flex-col bg-white pr-1.5 h-full"
        style={{ width: sidebarWidth }}
      >
        <div className="flex-1 flex flex-col gap-2 bg-white overflow-y-auto w-full min-w-0">
          {tabs.map((tab, i) => (
            <Tab
              key={tab.tld}
              mainTab={i === 0 ? true : tab.mainTab ?? false}
              tld={tab.tld}
              currentUser={currentUser}
              onRemoveTab={removeTab}
            />
          ))}
          <button
            onClick={() => addTab("youtube.com/embed/BxV14h0kFs0")}
            className="w-full min-w-0 flex md:flex flex-row items-center p-4 justify-center rounded-xl border-2 border-black bg-white"
            type="button"
          >
            New tab
          </button>
        </div>
        <div className="w-full min-w-0 border-1 border-black bg-white">
          {/* ... */}
        </div>
        <div className="w-full min-w-0 flex md:flex flex-row items-center p-3 my-2 rounded-xl border-2 border-black bg-white">
          {currentUser ? (
            <>
              <div className="ml-full justify-left">
                <h3 className="justify-left">
                  Hello, {currentUser.firstName} {currentUser.lastName}
                </h3>
                <h3 className="justify-left">
                  ({currentUser.emailAddress})
                </h3>
              </div>
              <div className="ml-auto justify-right">
                <ul className="flex justify-right list-none">
                  <li className="self-stretch py-1.5 pl-1.5leading-normal float-right">
                    <a
                      className="underline group flex items-center self-stretch leading-normal text-blue-700 hover:underline dark:text-blue-500"
                      href="/signout"
                    >
                      <img
                        src="/logout.svg"
                        alt="signout"
                        className="h-6 w-6 full max-w-none"
                      />
                    </a>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="ml-full justify-left">
                <h3 className="justify-left">
                  Sign in to contribute!
                </h3>
              </div>
              <div className="ml-auto justify-right">
                <ul className="flex justify-right list-none">
                  <li className="self-stretch py-1.5 pr-1.5 leading-normal float-right">
                    <a
                      className="underline group flex items-center gap-3 self-stretch leading-normal text-blue-700 hover:underline dark:text-blue-500"
                      href="/signin"
                    >
                      <img
                        src="/google.svg"
                        alt="signin"
                        className="h-6 w-6 full"
                      />
                    </a>
                  </li>
                  <li className="self-stretch p-1.5 leading-normal float-right">
                    <a
                      className="underline group flex items-center gap-3 self-stretch leading-normal text-blue-700 hover:underline dark:text-blue-500"
                      href="/signin"
                    >
                      <img
                        src="/apple.svg"
                        alt="signin"
                        className="h-6 w-6 full"
                      />
                    </a>
                  </li>
                  <li className="self-stretch py-1.5 pl-1.5leading-normal float-right">
                    <a
                      className="underline group flex items-center gap-3 self-stretch leading-normal text-blue-700 hover:underline dark:text-blue-500"
                      href="/signin"
                    >
                      <img
                        src="/login.svg"
                        alt="signin"
                        className="h-6 w-6 full"
                      />
                    </a>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
          {/* ...
            <div>
              {currentUser ? (
                <>
                  <ul className="flex list-none">
                    <li className="self-stretch p-1 text-gray-900 dark:text-gray-200 leading-normal">
                      <p>
                        Hello, {currentUser.firstName} {currentUser.lastName} ({currentUser.emailAddress})
                      </p>
                    </li>
                    <li className="self-stretch py-1.5 pr-1.5 leading-normal float-right">
                      <a
                        className="underline group flex items-center gap-3 self-stretch leading-normal text-blue-700 hover:underline dark:text-blue-500"
                        href="/signout"
                      >
                        <img
                          src="/login.svg"
                          alt="signout"
                          className="h-6 w-6 full"
                        />
                      </a>
                    </li>
                  </ul>
                </>
              ) : (
                <div className="w-full">
                  <ul className="flex w-full list-none items-center justify-between">
                    <li>
                      <p className="p-1">Sign in to contribute!</p>
                    </li>
                    <li className="ml-auto">
                      <div className="flex items-center gap-2">
                        <a href="/signin">
                          <img src="/google.svg" alt="Google sign in" className="h-6 w-6" />
                        </a>

                        <a href="/signin">
                          <img src="/apple.svg" alt="Apple sign in" className="h-6 w-6" />
                        </a>

                        <a href="/signin">
                          <img src="/login.svg" alt="Sign in" className="h-6 w-6" />
                        </a>
                      </div>
                    </li>
                  </ul>
                </div>
              )}
          </div>
          */}
        <div
          onPointerDown={(e) => {
            isResizingRef.current = true;
            startXRef.current = e.clientX;
            startWidthRef.current = sidebarWidth;

            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";

            (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
            e.preventDefault();
          }}
          className="absolute top-0 right-0 h-full w-2 cursor-col-resize"
          aria-label="Resize sidebar"
          role="separator"
        />
      </div>
      <div className="flex-1 border-2 rounded-xl border-black overflow-hidden flex">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto snap-y snap-mandatory"
        >
          {panelHeight == null ? (
            (
              <div
                className="h-full min-h-full snap-start flex items-center justify-center"
              >
                <Welcome
                  onAddTab={addTab}
                  currentUser={currentUser}
                />
              </div>
            )
          ) : (
            <>
              {beforeCount > 0 && (
                <div style={{ height: beforeCount * panelHeight }} />
              )}

              {Array.from(
                { length: endIndex - startIndex + 1 },
                (_, offset) => {
                  const i = startIndex + offset;
                  const tab = tabs[i];
                  return (
                    <div
                      key={tab.tld}
                      className="snap-start flex h-full w-full items-center justify-center"
                      style={{ height: panelHeight }}
                    >
                      {i === 0 ? (
                        <Welcome
                          onAddTab={addTab}
                          currentUser={currentUser}
                        />
                      ) : (
                        <div className="flex flex-col text-center h-full w-full">
                          {tab.mode === "iframe" ? (
                            <iframe
                              src={"https://" + tab.tld}
                              title={tab.tld}
                              className="w-full h-full border-0"
                            />
                          ) : (
                            <>
                              <div className="flex-1 flex flex-col items-center justify-center px-4">
                                <p className="text-center">
                                  This site can&apos;t be embedded here.
                                  <br />
                                  You can open it in a new tab instead.
                                </p>
                                <a
                                href={"https://" + tab.tld}
                                target="_blank"
                                rel="noreferrer"
                                className="flex flex-col pt-4 underline text-blue-600 items-center justify-center mb-4"
                              >
                                Open {"https://" + tab.tld} in a new tab
                              </a>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                },
              )}

              {afterCount > 0 && (
                <div style={{ height: afterCount * panelHeight }} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
