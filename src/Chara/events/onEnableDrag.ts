import { Pointer, Container } from "../../Models";
import { Unit } from "../../Unit/Model";
import { Chara } from "../Chara";
import onDrag from "./onDrag";

export default function onEnableDrag(
  chara: Chara,
  dragStart: (unit: Unit, x: number, y: number, chara: Chara) => void,
  dragEnd: (unit: Unit, x: number, y: number, chara: Chara) => void
) {
  chara.onDragEnd = dragEnd;
  chara.container.setInteractive();
  chara.input.setDraggable(chara.container);

  chara.input.on(
    "drag",
    (_pointer: Pointer, _obj: Container, x: number, y: number) =>
      onDrag(chara, x, y, dragStart)
  );

  chara.container.on(
    "dragend",
    (_pointer: Pointer, _dragX: number, dragY: number) =>
      chara.handleDragEnd(dragY)
  );
}
