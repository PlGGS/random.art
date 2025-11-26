import { useState, useRef, useEffect, useMemo } from "react";
import type { Route } from "./+types/home.ts";
import { Welcome } from "~/components/welcome.tsx";
import Tab from "../components/tab.tsx";

type TabMode = "fixed" | "iframe" | "external";
type TabType = {
  tld: string;
  mainTab?: boolean;
  mode: TabMode;
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "art 🎨" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export function loader() {
  return {
    message: `Or click to get started! ↓`,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const fixedFirstTab: TabType = { tld: "random.art", mainTab: true, mode: "fixed" };
  const [dynamicTabs, setDynamicTabs] = useState<TabType[]>([]);
  const tabs = useMemo(
    () => [fixedFirstTab, ...dynamicTabs],
    [fixedFirstTab, dynamicTabs],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoScrollIndex, setAutoScrollIndex] = useState<number | null>(null);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);
  const [iframeStatus, setIframeStatus] = useState<Record<number, "loading" | "success" | "error">>({});

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

      const newTab: TabType = { tld, mode };

      setDynamicTabs((prev) => {
        const newDynamic = [...prev, newTab];

        // index 0 is fixedFirstTab
        const newIndex = newDynamic.length;

        setCurrentIndex(newIndex);
        setAutoScrollIndex(newIndex);

        return newDynamic;
      });
    } catch {
      const newTab: TabType = { tld, mode: "external" };
      setDynamicTabs((prev) => [...prev, newTab]);
    }
  }

  function removeTab(tld: string) {
    if (tld === fixedFirstTab.tld) return;
    setDynamicTabs((prev) => prev.filter((tab) => tab.tld !== tld));
  }

  // Measure the height of the right-hand panel
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateHeight = () => {
      setPanelHeight(el.clientHeight);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
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

  return (
    <div className="w-full h-screen flex flex-row bg-white p-2 overflow-hidden">
      <div className="flex flex-col bg-white pr-1.5 h-full">
        <div className="flex-1 flex flex-col gap-2 bg-white overflow-y-auto">
          {tabs.map((tab, i) => (
            <Tab
              key={i} // use index for stability; first is always 0
              mainTab={i === 0 ? true : tab.mainTab ?? false}
              tld={tab.tld}
            />
          ))}
        </div>

        <button
          onClick={() => addTab("youtube.com")}
          // onClick={() => addTab("youtube.com/embed/BxV14h0kFs0")}
          // onClick={() => addTab("blakeboris.com")}
          className="mt-4 px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
        >
          Add tab
        </button>
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
                <Welcome message={loaderData.message} />
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
                      key={i}
                      className="snap-start flex h-full w-full items-center justify-center"
                      style={{ height: panelHeight }}
                    >
                      {i === 0 ? (
                        <Welcome message={loaderData.message} />
                      ) : (
                        <div className="flex flex-col text-center h-full w-full">
                          {tab.mode === "iframe" || iframeStatus[i] === "error" ? (
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
