import { Unit } from '../../Unit/Model';
import findTileByXY from '../findTileByXY';
import highlightTile from '../highlightTile';
import { Board } from '../Model';

export default (board: Board) => (unit: Unit, x: number, y: number) => {
  const tile = findTileByXY(board, x, y + 100);

  if (tile) {
    highlightTile(board, tile);
  }
};
