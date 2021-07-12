import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../../constants";
import button from "../../UI/button";
import panel from "../../UI/panel";
import text from "../../UI/text";
import { createEvent } from "../../utils";

export const key = "PlayerLoses";

export default (scene: Phaser.Scene) =>
  createEvent<Phaser.Scene>(scene.events, key);

export const onPlayerLoses = (scene: Phaser.Scene) => {
  const container = scene.add.container();
  panel(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, container, scene);

  text(500, 300, "YOU LOSE!", container, scene);

  button(500, 350, "Continue", container, scene, () => {
    console.log("continue");
  });
};
