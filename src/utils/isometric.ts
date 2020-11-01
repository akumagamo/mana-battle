import {tileWidth, tileHeight, centerX, centerY} from '../constants';

/**
 *
 * Converts board coordinates to a x,y position on a isometric scene
 * considering an origin point
 * @param x
 * @param y
 */

export function cartesianToIsometric(x: number, y: number) {
  return {
    x: (x - y) * tileWidth + centerX,
    y: (x + y) * tileHeight + centerY - 50,
  };
}

/**
 * On the battle screen we want a little more depth into the scene, so that
 * we can cram more units in to screen and make facing the other team
 * more dramatic :O
 * @param x
 * @param y
 */
export function cartesianToIsometricBattle(
  isTopSquad: boolean,
  x: number,
  y: number,
) {
  const TOP_SQUAD_OFFSET_X = 350;
  const TOP_SQUAD_OFFSET_Y = 50;

  const BOTTOM_SQUAD_OFFSET_X = 900;
  const BOTTOM_SQUAD_OFFSET_Y = 350;

  var tx = (x - y) * tileWidth;
  var ty = ((x + y) * tileHeight) / 2;

  const offsetX = isTopSquad ? TOP_SQUAD_OFFSET_X : BOTTOM_SQUAD_OFFSET_X;
  const offsetY = isTopSquad ? TOP_SQUAD_OFFSET_Y : BOTTOM_SQUAD_OFFSET_Y;

  return {
    x: tx + offsetX,
    y: ty + offsetY,
  };
}
