import { rowOffsetX, rowOffsetY, rowWidth, rowHeight } from './constants';
import { UnitList } from './Model';

export default (scene: Phaser.Scene) => {
  var rect = new Phaser.Geom.Rectangle(
    rowOffsetX,
    rowOffsetY,
    rowWidth,
    rowHeight
  );
  var graphics = scene.add.graphics({
    fillStyle: { color: 0x0000ff },
  });

  graphics.alpha = 0.2;

  graphics.fillRectShape(rect);
  return graphics;
};
