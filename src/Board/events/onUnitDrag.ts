import { Unit } from '../../Unit/Model';
import findTileByXY from '../findTileByXY';
import highlightTile from '../highlightTile';
import { Board } from '../Model';

export default (board: Board) => (unit: Unit, x: number, y: number) => {
  const tile = findTileByXY(board, x, y + 100);

  console.log(`board/events/onunitdrag`, x, y, board);
  console.log(tile.boardX, tile.boardY);
  // todo: refactor this, as tile is already known
  if (tile) {
    highlightTile(board, { x: tile.boardX, y: tile.boardY });
  }
};
