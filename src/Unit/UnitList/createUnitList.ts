import Phaser from "phaser";
import { UnitIndex } from "../Model";
import { Chara } from "../../Chara/Model";
import { List } from "immutable";
import renderListItem from "./renderListItem";
import { UnitList } from "./Model";
import refresh from "./actions/refresh";
import { getRowPosition } from "./actions/getRowPosition";
import { GAME_SPEED } from "../../env";

export default function (
  scene: Phaser.Scene,
  x: number,
  y: number,
  itemsPerPage: number,
  units: UnitIndex,
  onRefresh: (c: List<Chara>) => void
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

  refresh(unitList, onRefresh);

  scene.game.events.emit("UnitListSceneCreated", unitList);
  return unitList;
}

export function reposition(unitList: UnitList, chara: Chara) {
  const unitsToRender = getUnitsToRender(unitList);

  const pos = getRowPosition(
    unitList.container.x,
    unitList.container.y,
    unitsToRender.toList().findIndex((u) => u.id === chara.id)
  );

  unitList.scene.tweens.add({
    targets: chara.container,
    x: pos.x,
    y: pos.y,
    duration: 600 / GAME_SPEED,
    ease: "Cubic",
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
    ease: "Cubic",
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
    ease: "Cubic",
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
  units: UnitIndex;
  page: number;
  itemsPerPage: number;
}) {
  return units.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage);
}

export function renderRows(unitList: UnitList) {
  const unitsToRender = getUnitsToRender(unitList);
  unitsToRender.toIndexedSeq().map((u, i) => renderListItem(unitList, u, i));
}
