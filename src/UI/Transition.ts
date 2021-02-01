import * as Phaser from "phaser";

export const fadeIn = (scene: Phaser.Scene) => {
  return new Promise<void>((resolve) => {
    scene.cameras.main.fadeIn(1000);
    scene.cameras.main.once("camerafadeincomplete", () => {
      resolve();
    });
  });
};
export const fadeOut = (scene: Phaser.Scene) => {
  return new Promise<void>((resolve) => {
    scene.cameras.main.fadeOut(1000);
    scene.cameras.main.once("camerafadeoutcomplete", () => {
      resolve();
    });
  });
};
