import { Welcome } from "~/components/welcome.tsx";
import type { Route } from "./+types/home.ts";
import { Link } from "react-router-dom";
import { useState } from "react";
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
  const [tabs, setTabs] = useState<TabType[]>([
    { tld: "random.art", mainTab: true }
  ]);

  function addTab(tld: string) {
    setTabs((prev) => [...prev, { tld }]);
  }

  function removeTab(tld: string) {
    setTabs((prev) => prev.filter((tab) => tab.tld !== tld));
  }
  
  return (
    <div className="w-full h-screen flex flex-row bg-white p-2 overflow-hidden">
      <div className="flex flex-col bg-white pr-1.5 overflow-hidden">
        <div className="flex flex-col gap-2 bg-white overflow-hidden">
          {tabs.map((tab, i) => (
            <Tab
              key={tab.tld ?? i}
              mainTab={tab.mainTab ?? false}
              tld={tab.tld}
            />
          ))}
        </div>
      </div>
      <div className="flex-1 border-2 rounded-xl border-black overflow-hidden">
        <Welcome message={loaderData.message} />;
      </div>
    </div>
  );
}
