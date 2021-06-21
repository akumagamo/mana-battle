import events from "./events";
import { initialState, TitleSceneState } from "./Model";

export function turnOff(scene: Phaser.Scene, state: TitleSceneState) {
  state.container.destroy();
  state = initialState;

  events.forEach((k) => scene.events.off(k));
}
