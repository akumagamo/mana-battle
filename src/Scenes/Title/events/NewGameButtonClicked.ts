import storyManager from "../../storyManager";
import { TitleSceneState } from "../Model";
import { createEvent } from "../../../utils";


export const key = "NewGameButtonClicked";

export function handleNewGameButtonClicked({
  scene,
  state,
}: {
  scene: Phaser.Scene;
  state: TitleSceneState;
}): void {
  scene.scene.stop();
  storyManager(scene, state);
}

export const NewGameButtonClicked = (scene: Phaser.Scene) =>
  createEvent<{ scene: Phaser.Scene; state: TitleSceneState }>(scene, key);

