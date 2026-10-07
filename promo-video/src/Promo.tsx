import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { BrandScene } from "./scenes/BrandScene";
import { GuardrailScene } from "./scenes/GuardrailScene";
import { OutroScene } from "./scenes/OutroScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { ResultsScene } from "./scenes/ResultsScene";
import { SearchScene } from "./scenes/SearchScene";
import { C } from "./theme";

// Scenes start on bar lines of the 120 BPM soundtrack (scripts/make-music.mjs):
// 0s, 8s, 12s, 18s, 26s, 32s. Each sequence runs 12 frames past its bar so the
// next scene starts exactly on the beat while this one fades out.
export const Promo = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Problem" durationInFrames={252} premountFor={fps}>
          <ProblemScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />
        <TransitionSeries.Sequence name="Brand" durationInFrames={132} premountFor={fps}>
          <BrandScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />
        <TransitionSeries.Sequence name="Search" durationInFrames={192} premountFor={fps}>
          <SearchScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />
        <TransitionSeries.Sequence name="Results" durationInFrames={252} premountFor={fps}>
          <ResultsScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />
        <TransitionSeries.Sequence name="Guardrail" durationInFrames={192} premountFor={fps}>
          <GuardrailScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />
        <TransitionSeries.Sequence name="Outro" durationInFrames={240} premountFor={fps}>
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Audio name="Music" src={staticFile("music.wav")} />
    </AbsoluteFill>
  );
};
