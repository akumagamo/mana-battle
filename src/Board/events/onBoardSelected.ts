import { Board } from '../Model';

export default (board: Board) => {
  board.isSelected = true;
  board.tiles.forEach((tile) => tile.sprite.setTint(0x558899));
};
