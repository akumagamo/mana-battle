import { Board } from '../Model';

export default (board: Board) => {
  board.isSelected = false;

  board.tiles.forEach((t) => t.sprite.clearTint());
};
