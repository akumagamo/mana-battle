import Phaser from "phaser";
import { GAME_SPEED } from "../env";
import { preload } from "../preload";
import button from "../UI/button";

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super("WorldScene");
  }
  preload = preload;
  create() {
    this.cameras.main.setBackgroundColor("#000000");
    const container = this.add.container(300, 100);

    button(10, 400, "Battalion", container, this, () => {
      this.cameras.main.fadeOut(1000 / GAME_SPEED, 0, 0, 0);

      this.scene.transition({
        target: "TitleScene",
        duration: 1000,
        moveBelow: true,
        remove: true,
      });
    });

    button(210, 400, "Items", container, this, () => {
      container.destroy();

      this.scene.transition({
        target: "TitleScene",
        duration: 0,
        moveBelow: true,
      });
    });
  }
}
