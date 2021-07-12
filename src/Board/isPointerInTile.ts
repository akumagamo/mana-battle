import { tileHeight, tileWidth } from '../constants';
import { BoardTile } from './Model';

export function isPointerInTile(pointer: { x: number; y: number }) {
  return function (tile: { x: number; y: number }) {
    const dx = Math.abs(tile.x - pointer.x);
    const dy = Math.abs(tile.y - pointer.y);
    const deltaX = dx / tileWidth; // TODO: account for board scale
    const deltaY = dy / tileHeight;

    return deltaX + deltaY < 1;
  };
}
