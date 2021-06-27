import { boardPadding, cellSize } from '../config';
import { Vector } from '../Model';

/**
 * Converts a cell position to a position on the screen
 * @param cellVector A Cell position (eg x1y1)
 * @todo use this function to force types between boardX and screenX
 */
export function cellToScreenPosition({ x, y }: Vector) {
  return {
    x: boardPadding + x * cellSize,
    y: boardPadding + y * cellSize,
  };
}

/**
 * Given a position on screen, returns the correspondent
 * cell coordinates
 * @param screenVector
 */
export function screenToCellPosition({ x, y }: Vector) {
  return {
    x: Math.floor((x - boardPadding) / cellSize),
    y: Math.floor((y - boardPadding) / cellSize),
  };
}
