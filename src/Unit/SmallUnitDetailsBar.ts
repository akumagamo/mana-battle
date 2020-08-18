import * as Phaser from 'phaser';
import * as api from '../DB';
import {Container} from '../Models';
import {Chara} from '../Chara/Chara';
import {Unit, unitClassLabels} from './Model';
import {INVALID_STATE} from '../errors';
import {ItemSlot} from '../Item/Model';
import text from '../UI/text';

const colWidth = 150;
const rowHeight = 40;

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
export default function(
  x: number,
  y: number,
  scene: Phaser.Scene,
  unitId: string,
) {
  const container = scene.add.container();

  const panel = scene.add.image(x, y, 'panel');

  container.add(panel);

  panel.setOrigin(0, 0);
  panel.displayWidth = 1260;
  panel.displayHeight = 50;

  const unit = api.getUnit(unitId);

  unitStats(x,y,container, scene, unit);

  return container
}

function unitStats(x:number,y:number,container: Container, scene: Phaser.Scene, unit: Unit) {
  const {name, lvl, exp, currentHp, hp} = unit;


  row(container, scene)(x+10, y+10, [
    name,
    unitClassLabels[unit.class],
    `Lvl ${lvl}`,
    `Exp ${exp}`,
    '',
    '',
    '',
    `${currentHp} / ${hp} HP`,
  ]);
}
