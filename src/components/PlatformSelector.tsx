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

  // Close dropdown when clicking outside
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
    <div className="w-full py-5 px-4 sm:px-6">
      {/* Mobile: Dropdown */}
      <div className="block lg:hidden" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-lg bg-card border border-border hover:border-primary/50 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-md overflow-hidden border border-border">
              <Image
                src={currentPlatformInfo.logo}
                alt={currentPlatformInfo.name}
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
            <div className="text-left">
              <span className="font-semibold text-foreground block text-sm">
                {currentPlatformInfo.name}
              </span>
              <span className="text-xs text-muted-foreground">
                Current Platform
              </span>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-4 right-4 mt-2 bg-card rounded-lg shadow-xl border border-border overflow-hidden z-50">
            {platforms.map((platform, index) => (
              <button
                key={platform.id}
                onClick={() => {
                  setPlatform(platform.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 transition-all
                  ${currentPlatform === platform.id 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-secondary'
                  }
                  ${index !== 0 ? 'border-t border-border' : ''}
                `}
              >
                <div className={`
                  relative w-9 h-9 rounded-md overflow-hidden
                  ${currentPlatform === platform.id ? 'border-2 border-primary' : 'border border-border'}
                `}>
                  <Image
                    src={platform.logo}
                    alt={platform.name}
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                </div>
                <span className="font-semibold flex-1 text-left text-sm">{platform.name}</span>
                {currentPlatform === platform.id && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: Horizontal tabs with scroll */}
      <div className="hidden lg:block">
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {platforms.map((platform) => (
            <PlatformButton
              key={platform.id}
              platform={platform}
              isActive={currentPlatform === platform.id}
              onClick={() => setPlatform(platform.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface PlatformButtonProps {
  platform: PlatformInfo;
  isActive: boolean;
  onClick: () => void;
}

function PlatformButton({ platform, isActive, onClick }: PlatformButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`platform-tab ${isActive ? 'active' : ''}`}
    >
      <div className={`
        w-7 h-7 rounded-md overflow-hidden transition-all
        ${isActive ? 'border-2 border-white/30' : 'border border-border'}
      `}>
        <Image
          src={platform.logo}
          alt={platform.name}
          width={28}
          height={28}
          className="object-cover"
        />
      </div>
      <span className="font-semibold text-sm">
        {platform.name}
      </span>
      {isActive && (
        <Check className="w-4 h-4" />
      )}
    </button>
  );
}
