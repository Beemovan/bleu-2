"use client";

import Image from "next/image";
import { useState } from "react";
import { BrainStatus } from "../utilities/Types";
import { Sandbox } from "./Sandbox";
import MainDB from "../utilities/db-instance";

export default function SandboxWrapper() {
  const [brainStatus, setBrainStatus] = useState<BrainStatus>("Paused");
  const handleClickBrainStatus = () => {
    setBrainStatus(brainStatus === "Paused" ? "Thinking" : "Paused");
  };
  return (
    <div className="p-20 min-h-screen flex flex-col">
      <button
        className="self-end transition-colors bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-6 sm:h-8 px-3 sm:px-4"
        onClick={handleClickBrainStatus}
      >
        {brainStatus}
      </button>
      <div className=" flex grow font-[family-name:var(--font-geist-sans)]">
        <Sandbox brainStatus={brainStatus} />
      </div>
    </div>
  );
}
