import createChara from '../Chara/createChara';
import {Unit} from '../Unit/Model';
import getUnitPositionOnScreen from './getUnitPositionOnScreen';
import {Board} from './Model';

export default (board: Board, unit: Unit) => {
  const member = board.squad.members.get(unit.id);

  if (!member) return;
  const {x, y} = getUnitPositionOnScreen(member);

  const chara = createChara({
    scene: board.scene,
    unit,
    x: x * board.scale,
    y: y * board.scale,
    scale: board.scale * 3,
    animated: false,
    showHpBar: true,
  });

  board.container.add(chara.container);

  if (chara.unit.currentHp < 1) chara.tint(222222);

  return chara;
};
