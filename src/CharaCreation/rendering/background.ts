import { addChildToContainer } from "../../Browser/phaser";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants";
import { CharaCreationState } from "../Model";

export default function (scene: Phaser.Scene, state: CharaCreationState) {
  const bg = scene.add.image(0, 0, "map_select");
  bg.setOrigin(0);
  bg.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  addChildToContainer(state.container, bg);

  return bg;
}
