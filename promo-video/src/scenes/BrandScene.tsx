import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { LogoMark } from "../Logo";
import { Starfield } from "../Starfield";
import { C, clamp, display } from "../theme";

export const BrandScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ease = Easing.bezier(0.16, 1, 0.3, 1);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Starfield speed={(f) => interpolate(f, [0, 3 * fps], [9, 1.2], { ...clamp, easing: ease })} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 40 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 36,
            opacity: interpolate(frame, [0.15 * fps, 0.6 * fps], [0, 1], clamp),
            scale: interpolate(frame, [0.15 * fps, 1 * fps], [0.7, 1], {
              ...clamp,
              easing: Easing.spring({ damping: 14 }),
              output: "perceptual-scale",
            }),
          }}
        >
          <LogoMark size={220} />
          <div
            style={{
              fontFamily: display,
              fontWeight: 700,
              fontSize: 150,
              letterSpacing: "0.04em",
              color: C.fg,
            }}
          >
            SSD/PICKER
          </div>
        </div>
        <div
          style={{
            fontFamily: display,
            fontWeight: 500,
            fontSize: 64,
            color: C.muted,
            opacity: interpolate(frame, [1.1 * fps, 1.6 * fps], [0, 1], clamp),
            translate: `0px ${interpolate(frame, [1.1 * fps, 1.6 * fps], [24, 0], { ...clamp, easing: ease })}px`,
          }}
        >
          The right SSD, found at lightspeed.
        </div>
      </AbsoluteFill>
      {/* Flash on the beat drop */}
      <AbsoluteFill
        style={{
          backgroundColor: "#ffffff",
          opacity: interpolate(frame, [0, 0.3 * fps], [0.55, 0], clamp),
        }}
      />
    </AbsoluteFill>
  );
};
