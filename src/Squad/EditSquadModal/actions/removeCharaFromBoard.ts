import { StaticBoard } from '../../../Board/Model';
import { Chara } from '../../../Chara/Model';

export default (board: StaticBoard, charaToRemove: Chara) => {
  board.unitList = board.unitList.filter((c) => c.id !== charaToRemove.id);
  charaToRemove.destroy();
};
