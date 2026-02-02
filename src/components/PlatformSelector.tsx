"use client";

import Image from "next/image";
import { ChevronDown, Sparkles } from "lucide-react";
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
    <div className="w-full py-6 px-4 sm:px-6">
      {/* Mobile: Dropdown */}
      <div className="block lg:hidden" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-xl glass-strong border border-border/50 hover:border-primary/50 transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-2 ring-primary/20">
              <Image
                src={currentPlatformInfo.logo}
                alt={currentPlatformInfo.name}
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
            <div className="text-left">
              <span className="font-semibold text-foreground block">
                {currentPlatformInfo.name}
              </span>
              <span className="text-xs text-muted-foreground">
                Current Platform
              </span>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-4 right-4 mt-3 glass-premium rounded-xl shadow-2xl border border-border/50 overflow-hidden z-50 animate-in slide-in-from-top-2">
            {platforms.map((platform, index) => (
              <button
                key={platform.id}
                onClick={() => {
                  setPlatform(platform.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-4 px-5 py-4 transition-all duration-300
                  ${currentPlatform === platform.id 
                    ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-primary' 
                    : 'hover:bg-white/5'
                  }
                  ${index !== 0 ? 'border-t border-border/30' : ''}
                `}
              >
                <div className={`
                  relative w-10 h-10 rounded-lg overflow-hidden
                  ${currentPlatform === platform.id ? 'ring-2 ring-primary shadow-lg shadow-primary/30' : 'ring-1 ring-border/50'}
                `}>
                  <Image
                    src={platform.logo}
                    alt={platform.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <span className="font-semibold flex-1 text-left">{platform.name}</span>
                {currentPlatform === platform.id && (
                  <Sparkles className="w-5 h-5 text-primary fill-primary animate-pulse" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: Horizontal tabs with scroll */}
      <div className="hidden lg:block">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
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
      className={`
        relative flex items-center gap-3 px-6 py-3.5 rounded-xl
        transition-all duration-300 ease-out whitespace-nowrap
        ${
          isActive
            ? "platform-tab active"
            : "platform-tab glass-strong"
        }
      `}
    >
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl blur-xl" />
      )}
      <div className={`
        relative w-8 h-8 rounded-lg overflow-hidden transition-all duration-300
        ${isActive ? 'ring-2 ring-white/30 shadow-lg' : 'ring-1 ring-border/30'}
      `}>
        <Image
          src={platform.logo}
          alt={platform.name}
          fill
          className="object-cover"
          sizes="32px"
        />
      </div>
      <span
        className={`
          relative font-semibold text-sm
          ${isActive ? "text-white" : "text-muted-foreground"}
        `}
      >
        {platform.name}
      </span>
      {isActive && (
        <Sparkles className="relative w-4 h-4 text-white/80 fill-white/80 animate-pulse" />
      )}
    </button>
  );
}
