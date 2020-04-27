import {random} from '../utils/math';

export default (scene: Phaser.Scene) => (
  x: number,
  y: number,
  scale: number,
) => {
  const positions = [
    {x, y, scale},
    {x: x - 30 * scale, y, scale: scale * 0.8},
    {x: x + 30 * scale, y: y + 20, scale: scale * 0.7},
    {x: x - 60 * scale, y: y + 20, scale: scale * 0.4},
  ];

  positions.forEach((pos) => {
    const branch = scene.add.image(pos.x, pos.y, 'props/branch');
    const scale = pos.scale * 0.3;

    const rotation = (random(2, 4) / 10) * -1;

    branch.setScale(scale);
    branch.setOrigin(0.3, 1);
    branch.setRotation(rotation);
    scene.tweens.add({
      targets: branch,
      rotation: rotation * -1,
      duration: 6000,
      yoyo: true,
      repeat: -1,
      scaleX: scale + scale / 10,
      ease: 'Bounce',
    });
  });
};
