import { PointerDown } from "../../Browser/events";
import { addChildToContainer } from "../../Browser/phaser";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants";
import ConfirmButtonClicked from "../events/ConfirmButtonClicked";
import { CharaCreationState } from "../Model";

export default function (scene: Phaser.Scene, state: CharaCreationState) {
  const img = scene.add.image(
    SCREEN_WIDTH - 100,
    SCREEN_HEIGHT - 100,
    "arrow_right"
  );

  addChildToContainer(state.container, img);
  img.setInteractive();

  PointerDown(img).on(() => {
    ConfirmButtonClicked(scene, state);
  });
}
