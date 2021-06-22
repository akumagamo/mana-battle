import { CPU_FORCE, SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants";
import { MapScene } from "../MapScene";
import { delay, tween } from "../../Scenes/utils";
import moveCameraTo from "../rendering/moveCameraTo";

export default async (scene: MapScene) => {
  const title = scene.label(SCREEN_WIDTH / 2, 60, "Victory Condition");
  title.setAlpha(0);

  const castle = scene.state.cities.find(
    (c) => c.type === "castle" && c.force === CPU_FORCE
  );
  const delay_ = (n: number) => delay(scene, n);
  const tween_ = (n: any) => tween(scene, n);

  await delay_(500);
  await tween_({
    targets: title,
    alpha: 1,
    duration: 1000,
  });
  await delay_(500);
  moveCameraTo(scene, castle, 1000);
  const conquer = scene.label(
    SCREEN_WIDTH / 2,
    160,
    "Conquer enemy headquarters"
  );

  conquer.setAlpha(0);
  await tween_({
    targets: conquer,
    alpha: 1,
    duration: 500,
  });
  const pic = scene.add.sprite(SCREEN_WIDTH / 2, 350, "merano");
  pic.setOrigin(0.5);
  pic.setDisplaySize(250, 250);
  const name = scene.label(SCREEN_WIDTH / 2, 520, "Merano Castle");

  pic.setAlpha(0);
  name.setAlpha(0);

  scene.missionContainer.add(pic);

  await tween_({
    targets: [pic, name],
    alpha: 1,
    duration: 1000,
  });
  await delay_(1000);
  await tween_({
    targets: scene.missionContainer,
    alpha: 0,
    duration: 1000,
  });

  scene.missionContainer.destroy();
  scene.missionContainer = scene.add.container();
  const start = scene.label(
    SCREEN_WIDTH / 2,
    SCREEN_HEIGHT / 2,
    "Mission Start"
  );
  start.setAlpha(0);
  await tween_({
    targets: start,
    alpha: 1,
    duration: 1000,
  });
  await delay_(1000);
  await tween_({
    targets: scene.missionContainer,
    alpha: 0,
    duration: 1000,
  });
};
