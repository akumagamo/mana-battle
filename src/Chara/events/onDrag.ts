import { Container } from '../../Models';
import { Unit } from '../../Unit/Model';
import { Chara } from '../Model';

export default function onDrag(
  chara: Chara,
  x: number,
  y: number,
  container: Container,
  onDragStart: (unit: Unit, x: number, y: number, chara: Chara) => void
) {
  container.setDepth(Infinity);

  container.x = x;
  container.y = y;

  onDragStart(chara.props.unit, x, y, chara);
}
