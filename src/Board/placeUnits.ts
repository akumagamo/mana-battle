import addUnitToBoard from './addUnitToBoard';
import { StaticBoard } from './Model';
import sortUnitsByDepth from './sortUnitsByDepth';

export default (board: StaticBoard) => {
  board.squad.members.forEach((member) => {
    const unit = board.units.get(member.id);
    const chara = addUnitToBoard(board, unit);

    board.unitList = board.unitList.concat([chara]);
  });
  sortUnitsByDepth(board);
};
