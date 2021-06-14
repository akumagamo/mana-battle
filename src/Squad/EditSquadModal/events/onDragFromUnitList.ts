import findTileByXY from '../../../Board/findTileByXY';
import { Board } from '../../../Board/Model';
import { UnitList } from '../../../Unit/UnitList/Model';

export default (listScene: UnitList, board: Board, x: number, y: number) => {
  board.tiles.forEach((tile) => tile.sprite.clearTint());
  console.log(`squad/editsquadmodal/events/ondragfromunitList`, x, y, board);
  const boardSprite = findTileByXY(board, x, y);

  if (boardSprite) boardSprite.sprite.setTint(0x33ff88);
};
