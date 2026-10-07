import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { LogoMark } from "../Logo";
import { Starfield } from "../Starfield";
import { C, clamp, display, mono } from "../theme";

export const OutroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ease = Easing.bezier(0.16, 1, 0.3, 1);
  const swapAt = 3.4 * fps;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: mono }}>
      <Starfield speed={(f) => interpolate(f, [0, 7 * fps], [3, 0.2], { ...clamp, easing: ease })} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 36,
          opacity: interpolate(frame, [swapAt - 8, swapAt], [1, 0], clamp),
        }}
      >
        <div style={{ position: "relative", fontFamily: display, fontWeight: 500, fontSize: 104, color: C.muted }}>
          A week of tabs
          <div
            style={{
              position: "absolute",
              left: -10,
              top: "54%",
              height: 8,
              borderRadius: 4,
              background: C.warn,
              width: `${interpolate(frame, [0.6 * fps, 1.1 * fps], [0, 104], { ...clamp, easing: ease })}%`,
            }}
          />
        </div>
        <div
          style={{
            fontFamily: display,
            fontWeight: 500,
            fontSize: 104,
            color: C.fg,
            opacity: interpolate(frame, [1.3 * fps, 1.7 * fps], [0, 1], clamp),
            translate: `0px ${interpolate(frame, [1.3 * fps, 1.8 * fps], [30, 0], { ...clamp, easing: ease })}px`,
          }}
        >
          → <span style={{ color: C.accent }}>one confident pick.</span>
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 44,
          opacity: interpolate(frame, [swapAt, swapAt + 10], [0, 1], clamp),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 36,
            scale: interpolate(frame, [swapAt, swapAt + 0.8 * fps], [0.85, 1], {
              ...clamp,
              easing: ease,
              output: "perceptual-scale",
            }),
          }}
        >
          <LogoMark size={200} />
          <div style={{ fontFamily: display, fontWeight: 700, fontSize: 140, letterSpacing: "0.04em", color: C.fg }}>
            SSD/PICKER
          </div>
        </div>
        <div style={{ fontSize: 52, color: C.muted, opacity: interpolate(frame, [swapAt + 12, swapAt + 22], [0, 1], clamp) }}>
          Internal or external. Compatible. In budget.
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: interpolate(frame, [7.2 * fps, 8 * fps], [0, 1], clamp),
        }}
      />
    </AbsoluteFill>
  );
};
