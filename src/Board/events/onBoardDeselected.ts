import { StaticBoard } from '../Model';

export default (board: StaticBoard) => {
  board.isSelected = false;

  board.tiles.forEach((t) => t.sprite.clearTint());
};
