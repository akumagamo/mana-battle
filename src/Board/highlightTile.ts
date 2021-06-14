import { Board } from './Model';

export default (board: Board, { x, y }: { x: number; y: number }): void => {
  board.tiles.forEach((tile) => tile.sprite.clearTint());

  board.tiles.filter((t) => t.boardX === x && t.boardY === y);

  const tile = board.tiles.find((t) => t.boardX === x && t.boardY === y);

  tile.sprite.setTint(0x00cc00);
};
