import addUnitToBoard from './addUnitToBoard';
import { StaticBoard } from './Model';
import sortUnitsByDepth from './sortUnitsByDepth';

export default (board: StaticBoard) => {
  board.units.forEach((member) => {
    const chara = addUnitToBoard(board, member);

    board.unitList = board.unitList.concat([chara]);
  });

  sortUnitsByDepth(this);
};
