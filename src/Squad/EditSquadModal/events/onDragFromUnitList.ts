import findTileByXY from '../../../Board/findTileByXY';
import { Board } from '../../../Board/Model';
import { UnitList } from '../../../Unit/UnitList/Model';

export default (listScene: UnitList, board: Board, x: number, y: number) => {
  board.tiles.forEach((tile) => tile.sprite.clearTint());
  const boardSprite = findTileByXY(board, x - board.x, y - board.y + 100);

  if (boardSprite) boardSprite.sprite.setTint(0x33ff88);
};
