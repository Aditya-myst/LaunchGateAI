"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function Reveal({
  children,
  delay = 0,
  y = 32,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      { autoAlpha: 0, y },
      {
        autoAlpha: 1,
        y: 0,
        delay,
        duration: 1,
        ease: "power3.out",
      }
    );
  }, [delay, y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
