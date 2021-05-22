import { boardPadding, cellSize } from '../config';
import { Vector } from '../Model';

export function getPos({ x, y }: Vector) {
  return {
    x: boardPadding + x * cellSize,
    y: boardPadding + y * cellSize,
  };
}

export function getBoardPos({ x, y }: Vector) {
  const res = {
    x: Math.floor((x - boardPadding) / cellSize),
    y: Math.floor((y - boardPadding) / cellSize),
  };
  console.log(`RES::`, res);

  return res;
}
