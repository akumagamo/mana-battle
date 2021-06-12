import { Chara } from '../Model';

export default (chara: Chara) => (
  y: number,
  onDragEnd: (x: number, y: number) => void
) => {
  chara.container.setDepth(y);
  onDragEnd(chara.container.x || 0, chara.container.y || 0);
};
