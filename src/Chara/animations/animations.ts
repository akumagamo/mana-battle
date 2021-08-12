import { GAME_SPEED } from "../../env";

export default (scene: Phaser.Scene) => {
  loadAnimation(scene, "stand", [0, 1, 2], true);

  loadAnimation(scene, "cast", [3, 4, 5], false);

  loadAnimation(scene, "run", [6, 7, 8], true);

  loadAnimation(scene, "hit", [9, 10, 11], false);

  loadAnimation(scene, "die", [12, 13, 14], false);
};

function loadAnimation(
  scene: Phaser.Scene,
  key: string,
  frames: number[],
  repeat: boolean
) {
  if (!scene.anims.exists(key))
    scene.anims.create({
      key: key,
      frames: scene.anims.generateFrameNumbers("sprite_fighter", {
        frames,
      }),
      frameRate: 3 * GAME_SPEED,
      repeat: repeat ? -1 : 0,
    });
}
