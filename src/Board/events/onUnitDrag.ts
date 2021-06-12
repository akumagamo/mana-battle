import { Unit } from '../../Unit/Model';
import findTileByXY from '../findTileByXY';
import highlightTile from '../highlightTile';
import { StaticBoard } from '../Model';

export default (board: StaticBoard) => (unit: Unit, x: number, y: number) => {
  const tile = findTileByXY(board, x, y);

  // todo: refactor this, as tile is already known
  if (tile) {
    highlightTile(board, { x: tile.boardX, y: tile.boardY });
  }
};
