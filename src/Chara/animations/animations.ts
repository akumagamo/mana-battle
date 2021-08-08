import { GAME_SPEED } from "../../env";

export default (scene: Phaser.Scene) => {
  scene.anims.create({
    key: "stand",
    frames: scene.anims.generateFrameNumbers("sprite_fighter", {
      frames: [0, 1, 2],
    }),
    frameRate: 3 * GAME_SPEED,
    repeat: -1,
  });

  scene.anims.create({
    key: "run",
    frames: scene.anims.generateFrameNumbers("sprite_fighter", {
      frames: [0, 1, 2],
    }),
    frameRate: 3 * GAME_SPEED,
    repeat: -1,
  });

  scene.anims.create({
    key: "hit",
    frames: scene.anims.generateFrameNumbers("sprite_fighter", {
      frames: [0, 1, 2],
    }),
    frameRate: 3 * GAME_SPEED,
    repeat: -1,
  });

  scene.anims.create({
    key: "cast",
    frames: scene.anims.generateFrameNumbers("sprite_fighter", {
      frames: [0, 1, 2],
    }),
    frameRate: 3 * GAME_SPEED,
    repeat: -1,
  });

  scene.anims.create({
    key: "die",
    frames: scene.anims.generateFrameNumbers("sprite_fighter", {
      frames: [0, 1, 2],
    }),
    frameRate: 3 * GAME_SPEED,
    repeat: -1,
  });
};
