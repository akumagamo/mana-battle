import { Unit } from '../../Unit/Model';
import BoardScene from '../InteractiveBoardScene';

export default (board: BoardScene) => (unit: Unit, x: number, y: number) => {
  const tile = board.findTileByXY(x, y);

  if (tile) {
    board.highlightTile(tile);
  }

  board.unitList.find((u) => u.id === unit.id).charaWrapper.depth = Infinity;
};
