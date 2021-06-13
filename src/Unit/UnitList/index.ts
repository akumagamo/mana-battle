import Phaser from 'phaser';
import { Unit } from '../Model';
import { Chara } from '../../Chara/Model';
import { List } from 'immutable';
import renderListItem from './renderListItem';
import { UnitList } from './Model';
import { pageControls } from './pageControls';

export function createUnitList(
  scene: Phaser.Scene,
  x: number,
  y: number,
  itemsPerPage: number,
  units: List<Unit>
): UnitList {
  const container = scene.add.container(x, y);

  const unitList: UnitList = {
    scene,
    container,
    x,
    y,
    page: 0,
    itemsPerPage,
    units,
    charas: List(),
  };

  renderRows(unitList);

  pageControls(unitList);

  scene.game.events.emit('UnitListSceneCreated', unitList);
  return unitList;
}

export function getUnitIndex(unitList: UnitList, unit: Unit) {
  const itemsToRender = getUnitsToRender(unitList);
  return itemsToRender.findIndex((u) => u.id === unit.id);
}
export function removeUnitRow(unitList: UnitList, id: string) {
  const row = unitList.container.getByName('row_' + id);
  row.destroy();
}

export function reposition(unitList: UnitList, chara: Chara) {
  const rowBackground: any = unitList.container.getByName('row_' + chara.id);

  unitList.scene.tweens.add({
    targets: chara.container,
    x: rowBackground.x,
    y: rowBackground.y,
    duration: 600,
    ease: 'Cubic',
    repeat: 0,
    paused: false,
    yoyo: false,
  });

  unitList.scene.tweens.add({
    targets: chara.charaWrapper,
    x: rowBackground.x,
    y: rowBackground.y,
    duration: 600,
    ease: 'Cubic',
    repeat: 0,
    paused: false,
    yoyo: false,
  });
}
export function scaleDown(unitList: UnitList, chara: Chara) {
  unitList.scene.tweens.add({
    targets: chara.container,
    scale: 0.5,
    duration: 400,
    ease: 'Cubic',
    repeat: 0,
    paused: false,
    yoyo: false,
  });
}

export function scaleUp(scene: Phaser.Scene, chara: Chara) {
  scene.tweens.add({
    targets: chara.container,
    scale: 1,
    duration: 400,
    ease: 'Cubic',
    repeat: 0,
    paused: false,
    yoyo: false,
  });
}

function getUnitsToRender({
  units,
  page,
  itemsPerPage,
}: {
  units: List<Unit>;
  page: number;
  itemsPerPage: number;
}) {
  return units.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage);
}

export function renderRows(unitList: UnitList) {
  const unitsToRender = getUnitsToRender(unitList);
  unitsToRender.map((u, i) => renderListItem(unitList, u, i));
}
