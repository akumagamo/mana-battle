import storyManager from "../../storyManager";
import { TitleSceneState } from "../Model";
import { createEvent } from "../../../utils";
import { fadeOut } from "../../../UI/Transition";
import { GAME_SPEED } from "../../../env";

export const key = "NewGameButtonClicked";

export async function handleNewGameButtonClicked({
  scene,
  state,
}: {
  scene: Phaser.Scene;
  state: TitleSceneState;
}):Promise<void> {
  if (process.env.SOUND_ENABLED) {
    scene.tweens.add({
      targets: state.music,
      volume: 0,
      duration: 1000,
    });
  }

  await fadeOut(scene, 1000 / GAME_SPEED);

  scene.scene.stop();
  storyManager(scene);
}

export const NewGameButtonClicked = (scene: Phaser.Scene) =>
  createEvent<{ scene: Phaser.Scene; state: TitleSceneState }>(scene, key);
