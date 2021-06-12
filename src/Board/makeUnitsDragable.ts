import onEnableDrag from '../Chara/events/onEnableDrag';
import { Chara } from '../Chara/Model';
import { Unit } from '../Unit/Model';
import { StaticBoard } from './Model';

export default (
  board: StaticBoard,
  onDragStart: (unit: Unit, x: number, y: number, chara: Chara) => void,
  onDragEnd: (chara: Chara) => (x: number, y: number) => void
) => {
  board.unitList.forEach((chara) => {
    onEnableDrag(chara, onDragStart, onDragEnd);
  });
};
