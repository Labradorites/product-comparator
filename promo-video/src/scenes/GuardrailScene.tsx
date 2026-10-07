import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, clamp, display, mono } from "../theme";

const CHECKS = [
  { label: "TYPE", value: "Internal M.2" },
  { label: "FORM FACTOR", value: "2280" },
  { label: "INTERFACE", value: "NVMe PCIe" },
];

export const GuardrailScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ease = Easing.bezier(0.16, 1, 0.3, 1);
  const dropAt = 2.6 * fps;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        fontFamily: mono,
        padding: "130px 140px",
        background: `radial-gradient(ellipse at 50% 0%, rgba(128,82,255,.16), ${C.bg} 60%)`,
      }}
    >
      <div
        style={{
          fontFamily: display,
          fontWeight: 500,
          fontSize: 80,
          lineHeight: 1.15,
          color: C.fg,
          opacity: interpolate(frame, [0, 0.4 * fps], [0, 1], clamp),
          translate: `0px ${interpolate(frame, [0, 0.5 * fps], [24, 0], { ...clamp, easing: ease })}px`,
        }}
      >
        Compatibility is checked in code.
        <br />
        <span style={{ color: C.accent }}>Never guessed.</span>
      </div>

      <div style={{ display: "flex", gap: 40, marginTop: 90 }}>
        {CHECKS.map((check, i) => {
          const at = 0.8 * fps + i * 0.3 * fps;
          const draw = interpolate(frame, [at + 6, at + 16], [1, 0], clamp);
          return (
            <div
              key={check.label}
              style={{
                flex: 1,
                padding: "30px 34px",
                border: `2px solid ${C.line}`,
                borderRadius: 16,
                background: "rgba(10,18,30,.9)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                opacity: interpolate(frame, [at, at + 8], [0, 1], clamp),
                translate: `0px ${interpolate(frame, [at, at + 12], [30, 0], { ...clamp, easing: ease })}px`,
              }}
            >
              <div>
                <div style={{ fontSize: 30, color: C.muted, letterSpacing: "0.08em" }}>{check.label}</div>
                <div style={{ fontSize: 50, fontWeight: 500, color: "#fff", marginTop: 6 }}>{check.value}</div>
              </div>
              <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" fill="rgba(128,82,255,.18)" stroke={C.accent} strokeWidth="1.5" />
                <path
                  d="M7 12.5l3.2 3.2L17 9"
                  stroke="#fff"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={draw}
                />
              </svg>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 80,
          fontSize: 44,
          color: C.warn,
          display: "flex",
          alignItems: "center",
          gap: 24,
          opacity: interpolate(frame, [dropAt, dropAt + 8, dropAt + 1.2 * fps, dropAt + 1.6 * fps], [0, 1, 1, 0.45], clamp),
        }}
      >
        <span style={{ fontWeight: 700 }}>✕</span>
        <span style={{ position: "relative" }}>
          Samsung 870 EVO 1TB · SATA 2.5″
          <span
            style={{
              position: "absolute",
              left: 0,
              top: "52%",
              height: 4,
              background: C.warn,
              width: `${interpolate(frame, [dropAt + 10, dropAt + 22], [0, 100], clamp)}%`,
            }}
          />
        </span>
        <span style={{ color: C.muted }}>wrong interface, dropped</span>
      </div>

      <div
        style={{
          marginTop: 30,
          fontSize: 44,
          color: C.fg,
          opacity: interpolate(frame, [3.8 * fps, 4.2 * fps], [0, 1], clamp),
        }}
      >
        Every price is matched to the page it came from.
      </div>
    </AbsoluteFill>
  );
};
