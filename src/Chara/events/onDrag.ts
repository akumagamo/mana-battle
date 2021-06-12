import {Chara} from "../Chara";

export default function onDrag(chara:Chara, x: number, y: number) {
  chara.container.setDepth(Infinity);

  chara.container.x = x;
  chara.container.y = y;

  chara.onDragStart(chara.props.unit, x, y, chara);
}
