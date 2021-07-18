import { Scene } from "phaser";
import { MapSquad } from "../Model";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants";
import { Container } from "../../Models";
import button from "../../UI/button";
import { Unit, UnitIndex } from "../../Unit/Model";
import SmallUnitDetailsBar from "../../Unit/SmallUnitDetailsBar";
import { findMember } from "../../Squad/Model";
import onBoardUnitClicked from "../../Board/events/onBoardUnitClicked";
import createStaticBoard from "../../Board/createBoard";
import highlightTile from "../../Board/highlightTile";
import { INVALID_STATE } from "../../errors";

export default (
  scene: Phaser.Scene,
  mapSquad: MapSquad,
  units: UnitIndex,
  onClose: () => void
) => {
  const leader = findMember(
    (m) => m.id === mapSquad.squad.leader,
    mapSquad.squad
  );

  if (!leader) throw new Error(INVALID_STATE);

  let charaStats = scene.add.container(0, 0);

  const backdrop_ = backdrop(scene);

  const container = scene.add.container();

  let details: Container | null = null;

  const detailsBar = renderUnitDetailsBar(scene, details, container);

  const { board } = createStaticBoard(
    scene,
    mapSquad.squad,
    units,
    SCREEN_WIDTH / 2,
    SCREEN_HEIGHT / 3,
    0.7
  );

  container.add(board.container);

  onBoardUnitClicked(board, (chara) => {
    charaStats.removeAll(true);

    detailsBar(chara.props.unit);
  });

  const tile = board.tiles.find(
    (t) => t.boardX === leader.x && t.boardY === leader.y
  );
  if(tile) highlightTile(board, tile);

  const defaultUnit = units.find((u) => u.id === leader.id);

  if(defaultUnit) detailsBar(defaultUnit);

  button(1050, 480, "Close", container, scene, () => {
    charaStats.destroy();
    backdrop_.destroy();
    container.destroy();

    onClose();
  });
};

function backdrop(scene: Phaser.Scene) {
  const backdrop = scene.add.graphics();
  backdrop.fillStyle(0x000000, 0.5);
  backdrop.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  return backdrop;
}

function renderUnitDetailsBar(
  scene: Scene,
  details: Container | null,
  parent: Container
) {
  return function (unit: Unit) {
    details?.destroy();
    details = SmallUnitDetailsBar(330, 480, scene, unit);
    parent.add(details);
  };
}
