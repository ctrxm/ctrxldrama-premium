"use client";

import { lazy, Suspense, useEffect, useState } from "react";

const AdsDisplay = lazy(() => import("@/components/AdsDisplay").then(m => ({ default: m.AdsDisplay })));

export function LazyAds() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <Suspense fallback={null}>
      <AdsDisplay position="popup" />
      <AdsDisplay position="bottom" />
    </Suspense>
  );
}
