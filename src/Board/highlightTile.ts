import { Board, BoardTile } from './Model';

export default (board: Board, tile: BoardTile): void => {
  board.tiles.forEach((tile) => tile.sprite.clearTint());

  tile.sprite.setTint(0x00cc00);
};
