"use client";

import { useEffect, useRef, useState } from "react";
import { useBrain } from "./hooks/useBrain";
import { BrainStatus } from "../utilities/Types";

export const Sandbox: React.FC<{ brainStatus: BrainStatus }> = ({
  brainStatus,
}) => {
  const [bleuEl, setBleuEl] = useState<HTMLDivElement | null>(null);
  const brain = useBrain(bleuEl);

  useEffect(() => {
    if (!brain || brainStatus !== "Thinking") return;
    const interval = setInterval(() => brain?.think(), 100);
    return () => clearInterval(interval);
  }, [brain, brainStatus]);

  return (
    <main id="sandbox" className="bg-slate-200 w-full relative shadow-inner">
      <div
        id="bleu"
        ref={(el) => setBleuEl(el)}
        className="bg-blue-600 rounded-full h-10 w-10 drop-shadow absolute"
      ></div>
    </main>
  );
};
