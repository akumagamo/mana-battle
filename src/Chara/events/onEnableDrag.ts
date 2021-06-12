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
  chara.scene.input.setDraggable(chara.container);

  chara.container.name = chara.id;
  chara.scene.input.on(
    'drag',
    (_pointer: Pointer, obj: Container, x: number, y: number) => {
      /** when triggered, this event iterates on all gameobjects contained
       * in the scene. that's why we filter by the "name" */
      if (obj.name === chara.id) {
        onDrag(chara, x, y, obj, dragStart);
      }
    }
  );

  chara.container.on(
    'dragend',
    (_pointer: Pointer, _dragX: number, dragY: number) =>
      onDragEnd(chara)(dragY, dragEnd(chara))
  );
}
