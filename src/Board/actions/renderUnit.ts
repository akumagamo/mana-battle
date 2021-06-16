import addUnitToBoard from '../addUnitToBoard';
import { Board } from '../Model';

export default (board: Board) => (id: string) => {
  const unit = board.units.get(id);
  const chara = addUnitToBoard(board, unit);

  board.unitList = board.unitList.concat([chara]);

  return chara;
};
