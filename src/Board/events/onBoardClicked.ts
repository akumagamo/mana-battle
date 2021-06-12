import { SquadRecord } from '../../Squad/Model';
import {
  BOARD_HEIGHT,
  BOARD_OFFSET_X,
  BOARD_OFFSET_Y,
  BOARD_WIDTH,
} from '../constants';
import { StaticBoard } from '../Model';

export default (board: StaticBoard, fn: (sqd: SquadRecord) => void) => {
  var clickZone = board.scene.add.zone(
    board.x + BOARD_OFFSET_X,
    board.y + BOARD_OFFSET_Y,
    BOARD_WIDTH,
    BOARD_HEIGHT
  );
  clickZone.setInteractive();
  clickZone.setOrigin(0);
  clickZone.on(`pointerup`, () => {
    fn(board.squad);
  });
};
