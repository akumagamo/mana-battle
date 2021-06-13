import { getMember } from '../Squad/Model';
import getUnitPositionOnScreen from './getUnitPositionOnScreen';
import { StaticBoard } from './Model';
import sortUnitsByDepth from './sortUnitsByDepth';

export default (board: StaticBoard, id: string) => {
  const chara = board.unitList.find((chara) => chara.id === id);

  const { unit } = chara.props;

  const pos = getUnitPositionOnScreen(getMember(unit.id, board.squad));

  const tween = board.scene.tweens.add({
    targets: chara?.container,
    x: pos.x,
    y: pos.y,
    ease: 'Cubic',
    duration: 400,
    repeat: 0,
    paused: false,
    yoyo: false,
  });
  // TODO: optimize, fire only once if multiple units were move at the same time
  tween.on('complete', () => {
    sortUnitsByDepth(board);
  });
};
