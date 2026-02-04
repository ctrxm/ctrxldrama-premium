"use client";

import Image from "next/image";
import { ChevronDown, Check } from "lucide-react";
import { usePlatform, type PlatformInfo } from "@/hooks/usePlatform";
import { useState, useRef, useEffect } from "react";

export function PlatformSelector() {
  const { currentPlatform, setPlatform, platforms, getPlatformInfo } = usePlatform();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currentPlatformInfo = getPlatformInfo(currentPlatform);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full py-3 border-b border-border">
      <div className="block lg:hidden relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-card border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7 overflow-hidden border border-border">
              <Image
                src={currentPlatformInfo.logo}
                alt={currentPlatformInfo.name}
                fill
                className="object-cover"
                sizes="28px"
              />
            </div>
            <div className="text-left">
              <span className="font-medium text-foreground text-sm">
                {currentPlatformInfo.name}
              </span>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 mt-1 bg-card border border-border z-50">
            {platforms.map((platform, index) => (
              <button
                key={platform.id}
                onClick={() => {
                  setPlatform(platform.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 transition-colors
                  ${currentPlatform === platform.id 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted'
                  }
                  ${index !== 0 ? 'border-t border-border' : ''}
                `}
              >
                <div className={`
                  relative w-7 h-7 overflow-hidden
                  ${currentPlatform === platform.id ? 'border-2 border-primary' : 'border border-border'}
                `}>
                  <Image
                    src={platform.logo}
                    alt={platform.name}
                    fill
                    className="object-cover"
                    sizes="28px"
                  />
                </div>
                <span className="font-medium flex-1 text-left text-sm">{platform.name}</span>
                {currentPlatform === platform.id && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="hidden lg:block">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setPlatform(platform.id)}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm font-medium uppercase tracking-wider transition-colors whitespace-nowrap
                ${currentPlatform === platform.id 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <div className={`
                relative w-5 h-5 overflow-hidden
                ${currentPlatform === platform.id ? 'border border-primary' : 'border border-border'}
              `}>
                <Image
                  src={platform.logo}
                  alt={platform.name}
                  fill
                  className="object-cover"
                  sizes="20px"
                />
              </div>
              {platform.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
