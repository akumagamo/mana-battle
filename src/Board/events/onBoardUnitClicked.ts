import onClick from '../../Chara/events/onClick';
import { Chara } from '../../Chara/Model';
import highlightTile from '../highlightTile';
import { Board } from '../Model';

export default (board: Board, fn: (c: Chara) => void) => {
  board.unitList.forEach((chara) => {
    onClick(chara, () => {
      const pos = board.squad.members.get(chara.props.unit.id);
      //todo: this should be a board api
      const tile = board.tiles.find(
        (t) => t.boardX === pos.x && t.boardY === pos.y
      );
      highlightTile(board, tile);
      fn(chara);
    });
  });
};
