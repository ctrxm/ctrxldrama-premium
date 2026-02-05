"use client";

import Image from "next/image";
import { usePlatform } from "@/hooks/usePlatform";
import { useRef } from "react";

export function PlatformSelector() {
  const { currentPlatform, setPlatform, platforms } = usePlatform();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full py-4">
      <div 
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1"
      >
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => setPlatform(platform.id)}
            className={`platform-chip ${currentPlatform === platform.id ? 'active' : ''}`}
          >
            <div className="relative w-6 h-6 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={platform.logo}
                alt={platform.name}
                fill
                className="object-cover"
                sizes="24px"
              />
            </div>
            <span>{platform.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
