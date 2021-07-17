import { INVALID_STATE } from "../../errors";
import addUnitToBoard from "../addUnitToBoard";
import { Board } from "../Model";

export default (board: Board) => (id: string) => {
  const unit = board.units.get(id);
  if (!unit) throw new Error(INVALID_STATE);

  const chara = addUnitToBoard(board, unit);
  if (!chara) throw new Error(INVALID_STATE);

  board.unitList = board.unitList.concat([chara]);

  return chara;
};
