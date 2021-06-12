import {
  BOARD_HEIGHT,
  BOARD_OFFSET_X,
  BOARD_OFFSET_Y,
  BOARD_WIDTH,
} from './constants';
import { StaticBoard } from './Model';

export default (board: StaticBoard) => {
  var rect = new Phaser.Geom.Rectangle(
    board.x + BOARD_OFFSET_X,
    board.y + BOARD_OFFSET_Y,
    BOARD_WIDTH,
    BOARD_HEIGHT
  );
  var graphics = board.scene.add.graphics({
    fillStyle: { color: 0x0000ff },
  });

  graphics.alpha = 0.2;

  graphics.fillRectShape(rect);
};
