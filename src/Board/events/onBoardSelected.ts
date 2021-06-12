import { StaticBoard } from '../Model';

export default (board: StaticBoard) => {
  board.isSelected = true;
  board.tiles.forEach((tile) => tile.sprite.setTint(0x558899));
};
