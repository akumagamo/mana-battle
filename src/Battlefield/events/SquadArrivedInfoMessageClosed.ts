import { Chara } from "../../Chara/Model";
import { createEvent } from "../../utils";
import { MapScene } from "../MapScene";

export function handleCloseSquadArrivedInfoMessage(
  scene: MapScene,
  chara: Chara
) {
  chara.destroy();
  scene.refreshUI();
  scene.isPaused = false;
}

export const key = "CloseSquadArrivedInfoMessage";

export default (scene: Phaser.Scene) => createEvent<Chara>(scene.events, key);
