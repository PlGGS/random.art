import { useState, useRef, useEffect, useMemo } from "react";
import type { Route } from "./+types/home.ts";
import { Welcome } from "~/components/welcome.tsx";
import Tab from "../components/tab.tsx";

type TabType = {
  tld: string;
  mainTab?: boolean;
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
  const fixedFirstTab: TabType = { tld: "random.art", mainTab: true };
  const [dynamicTabs, setDynamicTabs] = useState<TabType[]>([]);
  const tabs = useMemo(
    () => [fixedFirstTab, ...dynamicTabs],
    [fixedFirstTab, dynamicTabs],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  function addTab(tld: string) {
    setDynamicTabs((prev) => [...prev, { tld }]);
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
          onClick={() => addTab("www.youtube.com/embed/BxV14h0kFs0")}
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
                        // First tab is always the Welcome layout
                        <Welcome message={loaderData.message} />
                      ) : (
                        <div className="flex flex-col text-center text-s h-full w-full">
                          <iframe
                            src={"https://" + (tab.tld)}
                            title="YouTube video player"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                          <p>
                            {tab.tld} has blocked embedding for security purposes.
                          </p>
                          <a
                            href={"https://" + (tab.tld)}
                            target="_blank"
                            rel="noreferrer"
                            className="underline text-blue-600"
                          >
                            Open {"https://" + (tab.tld)} in a new tab
                          </a>
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
