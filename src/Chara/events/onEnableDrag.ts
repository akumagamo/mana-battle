import { Pointer, Container } from '../../Models';
import { Unit } from '../../Unit/Model';
import { Chara } from '../Model';
import onDrag from './onDrag';
import onDragEnd from './onDragEnd';

export default function onEnableDrag(
  chara: Chara,
  dragStart: (unit: Unit, x: number, y: number, chara: Chara) => void,
  dragEnd: (chara: Chara) => (x: number, y: number) => void
) {
  chara.container.setInteractive();

  chara.container.on(
    'drag',
    (_pointer: Pointer, _obj: Container, x: number, y: number) =>
      onDrag(chara, x, y, dragStart)
  );

  chara.container.on(
    'dragend',
    (_pointer: Pointer, _dragX: number, dragY: number) =>
      onDragEnd(chara)(dragY, dragEnd(chara))
  );
}
