import { Container } from '../Models';
import { Scene } from 'phaser';

export default (
  x: number,
  y: number,
  width: number,
  height: number,
  container: Container,
  scene: Scene
) => {
  var rect = new Phaser.Geom.Rectangle(x, y, width, height);
  var graphics = scene.add.graphics({
    fillStyle: { color: 0x000000 },
    lineStyle: {
      width: 2,
      color: 0xaaaaaa,
    },
  });

  graphics.setAlpha(0.8);

  graphics.strokeRectShape(rect);

  graphics.fillRectShape(rect);
  graphics.strokeRect(x, y, width, height);

  container.add(graphics);

  return graphics;
};
