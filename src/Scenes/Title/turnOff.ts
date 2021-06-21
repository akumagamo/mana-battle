import unsubscribe from "./events/unsubscribe";
import { initialState, TitleSceneState } from "./Model";

export function turnOff(scene: Phaser.Scene, state: TitleSceneState) {
  state.container.destroy();
  state = initialState;
  unsubscribe(scene);
}
