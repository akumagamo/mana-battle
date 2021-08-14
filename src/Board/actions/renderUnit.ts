import { getUnit } from "../../Unit/Model";
import addUnitToBoard from "../addUnitToBoard";
import { Board } from "../Model";

export default (board: Board) => (id: string) => {
  const unit = getUnit(id, board.units);

  const chara = addUnitToBoard(board, unit);

  board.unitList = board.unitList.concat([chara]);

  return chara;
};
