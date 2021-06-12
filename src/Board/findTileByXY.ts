import { tileWidth, tileHeight } from '../constants';
import { BoardTile, StaticBoard } from './Model';

export default (board: StaticBoard, x: number, y: number) => {
  return board.tiles.find(isPointerInTile({ x, y: y + 100 }));
};
function isPointerInTile(pointer: { x: number; y: number }) {
  return function (tile: BoardTile) {
    const dx = Math.abs(tile.sprite.x - pointer.x);
    const dy = Math.abs(tile.sprite.y - pointer.y);
    const deltaX = dx / tileWidth; // TODO: account for board scale
    const deltaY = dy / tileHeight;

    return deltaX + deltaY < 1;
  };
}
