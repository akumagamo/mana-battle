import {Container} from '../Models';
import {Unit, unitJobLabels} from './Model';
import text from '../UI/text';
import panel from '../UI/panel';
import {SCREEN_WIDTH} from '../constants';

const colWidth = 130;

const row = (container: Container, scene: Phaser.Scene) => (
  x: number,
  y: number,
  strs: (string | number)[],
) =>
  strs.forEach((str, index) =>
    write(container, scene)(x + colWidth * index, y, str),
  );

const write = (container: Container, scene: Phaser.Scene) => (
  x: number,
  y: number,
  str: string | number,
) => text(x, y, str, container, scene);
export default function (
  x: number,
  y: number,
  scene: Phaser.Scene,
  unit: Unit,
) {
  const container = scene.add.container();

  panel(x, y, 5 * colWidth, 50, container, scene);

  unitStats(x, y, container, scene, unit);

  return container;
}

function unitStats(
  x: number,
  y: number,
  container: Container,
  scene: Phaser.Scene,
  unit: Unit,
) {
  const {name, lvl, exp, currentHp, hp} = unit;

  row(container, scene)(x + 10, y + 10, [
    name,
    unitJobLabels[unit.class],
    `Lvl ${lvl}`,
    `Exp ${exp}`,
    `${currentHp} / ${hp} HP`,
  ]);
}
