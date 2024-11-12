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
    const interval = setInterval(() => brain?.think(), 1000);
    return () => clearInterval(interval);
  }, [brain, brainStatus]);

  return (
    <main id="sandbox" className="bg-amber-100 w-full relative">
      <div
        id="bleu"
        ref={(el) => setBleuEl(el)}
        className="bg-blue-600 rounded-full h-10 w-10 drop-shadow-lg absolute"
      ></div>
    </main>
  );
};
