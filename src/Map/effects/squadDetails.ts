import { Scene } from 'phaser';
import { MapSquad } from '../Model';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../constants';
import { Container } from '../../Models';
import button from '../../UI/button';
import { Unit, UnitIndex } from '../../Unit/Model';
import SmallUnitDetailsBar from '../../Unit/SmallUnitDetailsBar';
import { MapScene } from '../MapScene';
import { findMember } from '../../Squad/Model';
import onBoardUnitClicked from '../../Board/events/onBoardUnitClicked';
import createStaticBoard from '../../Board/createStaticBoard';
import highlightTile from '../../Board/highlightTile';

export default (
  scene: MapScene,
  mapSquad: MapSquad,
  units: UnitIndex,
  onClose: () => void
) => {
  const leader = findMember(
    (m) => m.id === mapSquad.squad.leader,
    mapSquad.squad
  );

  let charaStats = scene.add.container(0, 0);

  const backdrop_ = backdrop(scene);

  const container = scene.add.container();

  let details: Container | null = null;

  const detailsBar = renderUnitDetailsBar(scene, details, container);

  const boardScene = createStaticBoard(scene,   mapSquad.squad, units, 200, 50, 0.7);
  onBoardUnitClicked(boardScene, (chara) => {
    charaStats.removeAll();

    detailsBar(chara.props.unit);
  });

  highlightTile(boardScene, leader);

  const defaultUnit = units.find((u) => u.id === leader.id);

  detailsBar(defaultUnit);

  button(1050, 550, 'Close', container, scene, () => {
    charaStats.destroy();
    backdrop_.destroy();
    container.destroy();

    onClose();
  });
};

function backdrop(scene: MapScene) {
  const backdrop = scene.add.graphics();
  backdrop.fillStyle(0x000000, 0.5);
  backdrop.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  // let rect = new Phaser.Geom.Rectangle(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  // backdrop.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
  // backdrop.on('pointerdown', () => {
  //   backdrop.destroy();
  //   onClose();
  // });
  return backdrop;
}

function renderUnitDetailsBar(
  scene: Scene,
  details: Container,
  parent: Container
) {
  return function (unit: Unit) {
    details?.destroy();
    details = SmallUnitDetailsBar(330, 480, scene, unit);
    parent.add(details);
  };
}
