import { GAME_SPEED } from "../../env";

export default (scene: Phaser.Scene) => {
  loadAnimation(scene, "stand", [0, 1, 2]);

  loadAnimation(scene, "cast", [3, 4, 5]);

  loadAnimation(scene, "run", [6, 7, 8]);

  loadAnimation(scene, "hit", [9, 10, 11]);

  loadAnimation(scene, "die", [12, 13, 14]);
};

function loadAnimation(scene: Phaser.Scene, key: string, frames: number[]) {
  if (!scene.anims.exists(key))
    scene.anims.create({
      key: key,
      frames: scene.anims.generateFrameNumbers("sprite_fighter", {
        frames,
      }),
      frameRate: 3 * GAME_SPEED,
      repeat: -1,
    });
}
