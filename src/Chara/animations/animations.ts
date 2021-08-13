import { GAME_SPEED } from "../../env";

export default (scene: Phaser.Scene) => {
  loadAnimation(scene, "stand", [0, 1, 2]);

  loadAnimation(scene, "cast", [3, 4, 5], false);

  loadAnimation(scene, "run", [6, 7, 8]);

  loadAnimation(scene, "hit", [9, 10, 11], false);

  loadAnimation(scene, "die", [12, 13, 14], false);

  loadAnimation(scene, "fireball", [0, 1, 2, 3, 4, 5, 6], false, 12, "fire");
};

function loadAnimation(
  scene: Phaser.Scene,
  key: string,
  frames: number[],
  repeat = true,
  frameRate = 3,
  texture = "sprite_fighter"
) {
  if (!scene.anims.exists(key))
    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers(texture, {
        frames,
      }),
      frameRate: frameRate * GAME_SPEED,
      repeat: repeat ? -1 : 0,
    });
}
