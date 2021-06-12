import onEnableDrag from '../Chara/events/onEnableDrag';
import { Chara } from '../Chara/Model';
import { Unit } from '../Unit/Model';
import addUnitToBoard from './addUnitToBoard';
import onUnitDrag from './events/onUnitDrag';
import makeUnitsDragable from './makeUnitsDragable';
import { StaticBoard } from './Model';
import sortUnitsByDepth from './sortUnitsByDepth';

export default (board: StaticBoard) => {
  board.squad.members.forEach((member) => {
    const unit = board.units.get(member.id);
    const chara = addUnitToBoard(board, unit);

    board.unitList = board.unitList.concat([chara]);
  });

  makeUnitsDragable(
    board,
    (unit,x,y,chara)=>{

	onUnitDrag(board)(unit,x,y)

    },
    () => () => {}
  );

  sortUnitsByDepth(board);
};
