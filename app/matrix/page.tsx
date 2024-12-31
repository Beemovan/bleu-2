"use client";

import { useMemo, useState } from "react";
import IntelligenceMatrix from "../utilities/IntelligenceMatrix";

export default function Page() {
  const [input, setInput] = useState("");

  const model = useMemo(() => {
    return new IntelligenceMatrix([
      {
        name: "base",
        len: 128,
      },
    ]);
  }, []);

  return (
    <main className="w-full min-h-10 bg-slate-200 flex flex-col gap-6 p-6">
      <div className="flex gap-2 [&>*]:px-2 [&>*]:py-1 [&>*]:rounded-md">
        <input
          type="text"
          name="input"
          className="w-[200px]"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className=" bg-purple-300 hover:bg-purple-400">Run</button>
      </div>
      <span>Output: {1}</span>
    </main>
  );
}
