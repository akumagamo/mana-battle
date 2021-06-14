import { Board } from '../../../Board/Model';
import { Chara } from '../../../Chara/Model';

export default (board: Board, charaToRemove: Chara) => {
  board.unitList = board.unitList.filter((c) => c.id !== charaToRemove.id);
  charaToRemove.destroy();
};
