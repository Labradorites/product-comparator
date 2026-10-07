import { Composition, Folder } from "remotion";
import { Promo } from "./Promo";
import { BrandScene } from "./scenes/BrandScene";
import { GuardrailScene } from "./scenes/GuardrailScene";
import { OutroScene } from "./scenes/OutroScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { ResultsScene } from "./scenes/ResultsScene";
import { SearchScene } from "./scenes/SearchScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Promo" component={Promo} durationInFrames={1200} fps={30} width={1920} height={1080} />
      <Folder name="Scenes">
        <Composition id="Problem" component={ProblemScene} durationInFrames={252} fps={30} width={1920} height={1080} />
        <Composition id="Brand" component={BrandScene} durationInFrames={132} fps={30} width={1920} height={1080} />
        <Composition id="Search" component={SearchScene} durationInFrames={192} fps={30} width={1920} height={1080} />
        <Composition id="Results" component={ResultsScene} durationInFrames={252} fps={30} width={1920} height={1080} />
        <Composition id="Guardrail" component={GuardrailScene} durationInFrames={192} fps={30} width={1920} height={1080} />
        <Composition id="Outro" component={OutroScene} durationInFrames={240} fps={30} width={1920} height={1080} />
      </Folder>
    </>
  );
};
