import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, clamp, display, mono } from "../theme";

// Spec jargon, prices and reviews pile up around the question.
const CHIPS = [
  { label: "M.2 2280", x: 140, y: 120, color: C.muted },
  { label: "NVMe or SATA?", x: 640, y: 150, color: C.muted },
  { label: "PCIe Gen 4", x: 1300, y: 110, color: C.muted },
  { label: "Shopee  S$129", x: 220, y: 300, color: C.amber },
  { label: "DRAM-less?", x: 1430, y: 290, color: C.muted },
  { label: "Lazada  S$119", x: 1340, y: 780, color: C.amber },
  { label: "TLC vs QLC", x: 160, y: 820, color: C.muted },
  { label: "Amazon  S$142", x: 620, y: 900, color: C.amber },
  { label: "★4.6 vs ★2.1", x: 1050, y: 860, color: C.warn },
  { label: "2230 or 2280?", x: 900, y: 300, color: C.muted },
];

export const ProblemScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const blurOut = interpolate(frame, [4.6 * fps, 5.4 * fps], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: mono }}>
      {CHIPS.map((chip, i) => {
        const at = 0.6 * fps + i * 0.3 * fps;
        const pop = interpolate(frame, [at, at + 0.35 * fps], [0, 1], {
          ...clamp,
          easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        });
        return (
          <div
            key={chip.label}
            style={{
              position: "absolute",
              left: chip.x,
              top: chip.y,
              padding: "18px 30px",
              border: `2px solid ${C.line}`,
              borderRadius: 12,
              background: "rgba(10,18,30,.9)",
              color: chip.color,
              fontSize: 44,
              fontWeight: 500,
              whiteSpace: "nowrap",
              opacity: pop * interpolate(blurOut, [0, 1], [1, 0.22]),
              scale: interpolate(pop, [0, 1], [0.6, 1]),
              translate: `0px ${Math.sin(frame / 18 + i * 1.7) * 8}px`,
              rotate: `${Math.sin(i * 2.3) * 3}deg`,
              filter: `blur(${blurOut * 7}px)`,
            }}
          >
            {chip.label}
          </div>
        );
      })}

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            fontFamily: display,
            fontWeight: 500,
            fontSize: 128,
            color: C.fg,
            letterSpacing: "-0.01em",
            opacity: interpolate(frame, [0, 0.6 * fps, 4.4 * fps, 4.8 * fps], [0, 1, 1, 0], clamp),
            translate: `0px ${interpolate(frame, [0, 0.6 * fps], [30, 0], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) })}px`,
          }}
        >
          Buying an SSD?
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 28 }}>
        <div
          style={{
            fontFamily: display,
            fontWeight: 500,
            fontSize: 132,
            color: C.fg,
            opacity: interpolate(frame, [5 * fps, 5.5 * fps], [0, 1], clamp),
            scale: interpolate(frame, [5 * fps, 5.5 * fps], [1.08, 1], {
              ...clamp,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              output: "perceptual-scale",
            }),
          }}
        >
          A week of tabs.
        </div>
        <div
          style={{
            fontSize: 60,
            color: C.muted,
            opacity: interpolate(frame, [5.9 * fps, 6.4 * fps], [0, 1], clamp),
          }}
        >
          …and still no confident pick.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
