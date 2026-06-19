"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function OrbitalMesh() {
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!root.current) return;

    const rings = root.current.querySelectorAll(".mesh-ring");
    const dots = root.current.querySelectorAll(".mesh-dot");

    rings.forEach((ring, index) => {
      gsap.to(ring, {
        rotate: index % 2 === 0 ? 360 : -360,
        duration: 26 + index * 7,
        repeat: -1,
        ease: "none",
      });
    });

    gsap.to(dots, {
      scale: 1.5,
      opacity: 1,
      duration: 1.6,
      stagger: 0.18,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  return (
    <div ref={root} className="pointer-events-none relative h-[520px] w-[520px]">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="mesh-ring absolute inset-0 m-auto rounded-full border border-black/20"
          style={{
            height: `${500 - i * 76}px`,
            width: `${500 - i * 76}px`,
            transform: `rotate(${i * 37}deg)`,
            borderColor: i === 1 ? "rgba(239, 59, 45, 0.75)" : "rgba(0,0,0,0.18)",
          }}
        >
          <span
            className="mesh-dot absolute -left-1 top-1/2 h-3 w-3 rounded-full bg-black/40"
            style={{
              background: i === 1 ? "#ef3b2d" : "rgba(0,0,0,0.45)",
            }}
          />
        </div>
      ))}
    </div>
  );
}