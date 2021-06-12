import onClick from '../../Chara/events/onClick';
import { Chara } from '../../Chara/Model';
import highlightTile from '../highlightTile';
import { StaticBoard } from '../Model';

export default (board: StaticBoard, fn: (c: Chara) => void) => {
  board.unitList.forEach((chara) => {
    onClick(chara, () => {
      const pos = board.squad.members.get(chara.props.unit.id);
      highlightTile(board, pos);
      fn(chara);
    });
  });
};
