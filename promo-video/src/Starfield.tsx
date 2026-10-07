import type React from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";

// Deterministic 2D take on the site's three.js warp. `speed` is the only knob:
// 1 is the idle cruise, higher values are the boost while a search runs.
const STARS = Array.from({ length: 340 }, (_, i) => {
  const a = random(`a${i}`) * Math.PI * 2;
  const r = 0.04 + random(`r${i}`) * 1.3;
  return {
    x: Math.cos(a) * r,
    y: Math.sin(a) * r * 0.75,
    z0: random(`z${i}`),
    tint: random(`t${i}`) < 0.22 ? "#a98bff" : "#dff3ff",
  };
});

export const Starfield: React.FC<{
  readonly speed: (frame: number) => number;
  readonly opacity?: number;
}> = ({ speed, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  let travelled = 0;
  for (let f = 0; f < frame; f++) travelled += speed(f);
  const v = speed(frame);
  const cx = width / 2;
  const cy = height / 2;
  const focal = width * 0.32;

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg width={width} height={height}>
        {STARS.map((s, i) => {
          let z = (s.z0 - travelled * 0.004) % 1;
          if (z < 0) z += 1;
          z = 0.03 + z * 0.97;
          const z2 = Math.min(1, z + 0.003 + v * 0.011);
          const near = 1 - z;
          return (
            <line
              key={i}
              x1={cx + (s.x / z) * focal}
              y1={cy + (s.y / z) * focal}
              x2={cx + (s.x / z2) * focal}
              y2={cy + (s.y / z2) * focal}
              stroke={s.tint}
              strokeWidth={0.6 + near * 2.6}
              strokeOpacity={Math.min(1, near * near * 1.6)}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(4,6,12,0) 0%, rgba(4,6,12,.55) 60%, rgba(4,6,12,.92) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
