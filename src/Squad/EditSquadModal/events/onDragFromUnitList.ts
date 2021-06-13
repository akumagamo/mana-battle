import findTileByXY from '../../../Board/findTileByXY';
import { StaticBoard } from '../../../Board/Model';
import { UnitList } from '../../../Unit/UnitList/Model';

export default (
  listScene: UnitList,
  board: StaticBoard,
  x: number,
  y: number
) => {
  board.tiles.forEach((tile) => tile.sprite.clearTint());
  const boardSprite = findTileByXY(board, x - board.x + 50, y - board.y + 250);

  if (boardSprite) boardSprite.sprite.setTint(0x33ff88);
};
