import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Starfield } from "../Starfield";
import { C, clamp, display, mono } from "../theme";

// Illustrative rows for the promo, not live prices.
const FITS = [
  { name: "WD Blue SN580 1TB", price: "S$95", shop: "shopee.sg", score: "96% match" },
  { name: "Crucial P3 Plus 1TB", price: "S$102", shop: "lazada.sg", score: "93% match" },
  { name: "Kingston NV3 1TB", price: "S$109", shop: "amazon.sg", score: "90% match" },
];

const Row: React.FC<{
  readonly name: string;
  readonly price: string;
  readonly meta: string;
  readonly note: string;
  readonly noteColor: string;
  readonly at: number;
  readonly highlight?: number;
}> = ({ name, price, meta, note, noteColor, at, highlight = 0 }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [at, at + 10], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 0.8, 0.2, 1),
  });
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "18px 28px",
        borderBottom: "2px solid #14212e",
        borderLeft: `6px solid rgba(128,82,255,${highlight})`,
        background: `rgba(128,82,255,${highlight * 0.12})`,
        opacity: enter,
        translate: `0px ${interpolate(enter, [0, 1], [28, 0])}px`,
      }}
    >
      <div>
        <div style={{ fontSize: 52, fontWeight: 500, color: "#fff" }}>{name}</div>
        <div style={{ fontSize: 32, color: "#8fa6b8", marginTop: 4 }}>{meta}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 60, fontWeight: 500, color: "#fff" }}>{price}</div>
        <div style={{ fontSize: 34, color: noteColor, marginTop: 2 }}>{note}</div>
      </div>
    </div>
  );
};

export const ResultsScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pick = interpolate(frame, [3.6 * fps, 4.2 * fps], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: mono }}>
      <Starfield speed={() => 0.8} opacity={0.45} />
      <AbsoluteFill style={{ padding: "90px 140px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div
            style={{
              fontFamily: display,
              fontWeight: 500,
              fontSize: 72,
              color: C.fg,
              opacity: interpolate(frame, [0, 0.3 * fps], [0, 1], clamp),
            }}
          >
            Fits your laptop. In budget.
          </div>
          <div style={{ fontSize: 26, color: C.muted, opacity: 0.7 }}>illustrative results</div>
        </div>
        <div
          style={{
            fontSize: 38,
            color: C.accent,
            marginTop: 18,
            marginBottom: 22,
            opacity: interpolate(frame, [0.2 * fps, 0.5 * fps], [0, 1], clamp),
          }}
        >
          1TB · M.2 2280 · NVMe · ≤ S$120
        </div>

        {FITS.map((item, i) => (
          <Row
            key={item.name}
            name={item.name}
            price={item.price}
            meta={`${item.shop} · retrieved 14:32 SGT`}
            note={item.score}
            noteColor={C.accent}
            at={0.5 * fps + i * 0.35 * fps}
            highlight={i === 0 ? pick : 0}
          />
        ))}

        <div
          style={{
            fontFamily: display,
            fontWeight: 500,
            fontSize: 34,
            color: C.warn,
            marginTop: 26,
            marginBottom: 2,
            opacity: interpolate(frame, [2 * fps, 2.3 * fps], [0, 1], clamp),
          }}
        >
          Fits specs, over budget
        </div>
        <Row
          name="Samsung 990 EVO Plus 1TB"
          price="S$134"
          meta="shopee.sg · retrieved 14:32 SGT"
          note="over budget by S$14"
          noteColor={C.warn}
          at={2.3 * fps}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
