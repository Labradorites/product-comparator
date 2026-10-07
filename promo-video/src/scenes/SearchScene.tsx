import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Starfield } from "../Starfield";
import { C, clamp, display, mono } from "../theme";

const QUERY = "1TB M.2 NVMe under $120";

const STEPS = [
  "→ web search across Singapore retailers",
  "→ extract offers from the pages",
  "→ check every price against its page",
];

export const SearchScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typed = Math.floor(interpolate(frame, [0.5 * fps, 2.5 * fps], [0, QUERY.length], clamp));
  const pressAt = 2.8 * fps;
  const searching = frame >= pressAt;
  const elapsed = interpolate(frame, [pressAt, 6 * fps], [0, 11.8], clamp);
  const dots = ".".repeat(1 + (Math.floor(frame / 8) % 3));

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: mono }}>
      <Starfield
        speed={(f) =>
          interpolate(f, [pressAt, pressAt + 0.8 * fps], [1, 7], {
            ...clamp,
            easing: Easing.bezier(0.5, 0, 0.2, 1),
          })
        }
      />
      <AbsoluteFill style={{ padding: "150px 160px", alignItems: "center" }}>
        <div
          style={{
            fontFamily: display,
            fontWeight: 500,
            fontSize: 96,
            color: C.fg,
            opacity: interpolate(frame, [0, 0.4 * fps], [0, 1], clamp),
          }}
        >
          Say what you need.
        </div>

        <div style={{ display: "flex", gap: 24, marginTop: 80, width: "100%" }}>
          <div
            style={{
              flex: 1,
              height: 150,
              display: "flex",
              alignItems: "center",
              gap: 28,
              padding: "0 40px",
              border: `3px solid ${C.accent}`,
              borderRadius: 14,
              background: "rgba(6,12,22,.88)",
              boxShadow: "0 0 0 8px rgba(128,82,255,.14), 0 0 90px rgba(128,82,255,.3)",
            }}
          >
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
            <div style={{ fontSize: 68, fontWeight: 500, color: "#fff", whiteSpace: "pre" }}>
              {QUERY.slice(0, typed)}
              <span
                style={{
                  color: C.accent,
                  opacity: !searching && Math.floor(frame / 12) % 2 === 0 ? 1 : 0,
                }}
              >
                ▍
              </span>
            </div>
          </div>
          <div
            style={{
              width: 340,
              height: 150,
              borderRadius: 14,
              background: C.accent,
              color: "#fff",
              fontSize: 54,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scale: interpolate(frame, [pressAt - 4, pressAt, pressAt + 6], [1, 0.92, 1], clamp),
              opacity: searching ? 0.7 : 1,
            }}
          >
            Search ⏎
          </div>
        </div>

        <div
          style={{
            width: "100%",
            marginTop: 60,
            paddingBottom: 20,
            borderBottom: `2px solid ${C.line}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            opacity: interpolate(frame, [pressAt, pressAt + 6], [0, 1], clamp),
          }}
        >
          <span style={{ fontSize: 46, color: C.muted }}>searching{dots}</span>
          <span style={{ fontSize: 72, fontWeight: 500, color: C.accent }}>{elapsed.toFixed(1)}s</span>
        </div>

        <div style={{ width: "100%", marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
          {STEPS.map((step, i) => {
            const at = pressAt + 0.5 * fps + i * 0.7 * fps;
            return (
              <div
                key={step}
                style={{
                  fontSize: 44,
                  color: C.fg,
                  opacity: interpolate(frame, [at, at + 8], [0, 0.9], clamp),
                  translate: `${interpolate(frame, [at, at + 10], [-24, 0], clamp)}px 0px`,
                }}
              >
                {step}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
