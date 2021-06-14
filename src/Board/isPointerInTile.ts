import { tileHeight, tileWidth } from '../constants';
import { BoardTile } from './Model';

export function isPointerInTile(pointer: { x: number; y: number }) {
  return function (tile: {
    sprite: { displayOriginX: number; displayOriginY: number };
  }) {
    const dx = Math.abs(tile.sprite.displayOriginX - pointer.x);
    const dy = Math.abs(tile.sprite.displayOriginY - pointer.y);
    const deltaX = dx / tileWidth; // TODO: account for board scale
    const deltaY = dy / tileHeight;

    return deltaX + deltaY < 1;
  };
}
