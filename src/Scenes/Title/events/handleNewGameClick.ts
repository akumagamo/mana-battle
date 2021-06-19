import storyManager from "../../storyManager";
import { TitleSceneState } from "../Model";

export const key = "handleNewGameClicked";

export function handleNewGameClick(
  scene: Phaser.Scene,
  state: TitleSceneState
): void {
  scene.scene.stop();
  storyManager(scene, state);
}

export function once(scene: Phaser.Scene, state: TitleSceneState) {
  scene.events.once(key, () => handleNewGameClick(scene, state));
}

export const emit = (scene: Phaser.Scene) => () => {
  scene.events.emit(key);
};
