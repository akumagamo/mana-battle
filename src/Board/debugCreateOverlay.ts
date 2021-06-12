import { tileHeight, tileWidth } from '../constants';
import { StaticBoard } from './Model';

export default (board: StaticBoard) => {
  const width = board.tiles[0].sprite.width * board.scale * 3;
  const height = board.tiles[0].sprite.height * board.scale * 3;
  var rect = new Phaser.Geom.Rectangle(
    board.x - width / 2,
    board.y - height / 2,
    width,
    height + height / 3
  );
  var graphics = board.scene.add.graphics({
    fillStyle: { color: 0x0000ff },
  });

  graphics.alpha = 0.2;

  graphics.fillRectShape(rect);
};
