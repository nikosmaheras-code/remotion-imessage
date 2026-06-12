import { Composition } from "remotion";
import { DemoDM, DEMO_DM_DURATION } from "./DemoDM";
import { DemoGroup, DEMO_GROUP_DURATION } from "./DemoGroup";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DemoDM"
        component={DemoDM}
        durationInFrames={DEMO_DM_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DemoGroup"
        component={DemoGroup}
        durationInFrames={DEMO_GROUP_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
