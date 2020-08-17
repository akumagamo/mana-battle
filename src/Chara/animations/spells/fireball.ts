import {Scene} from 'phaser';

export default (scene: Scene, x: number, y: number) => {
  var config = {
    key: 'burn',
    frames: scene.anims.generateFrameNumbers('fire', {
      frames: [0, 1, 2, 3, 5, 6, 7],
    }),
    frameRate: 12,
    repeat: -1,
  };
  scene.anims.create(config);
  const sprite = scene.add.sprite(x, y, 'fire').play('burn');
  sprite.setScale(2);
  sprite.setRotation(2);

  return sprite;
};
