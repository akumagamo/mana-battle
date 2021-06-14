import { Container } from '../../Models';
import { Unit } from '../../Unit/Model';
import { Chara } from '../Model';

export default function onDrag(
  chara: Chara,
  x: number,
  y: number,
  onDragStart: (unit: Unit, x: number, y: number, chara: Chara) => void
) {
  chara.container.setDepth(Infinity);

  chara.container.x = x;
  chara.container.y = y;

  onDragStart(chara.props.unit, x, y, chara);
}
