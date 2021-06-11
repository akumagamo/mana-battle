import StaticBoardScene from "../../Board/StaticBoardScene";
import { PLAYER_FORCE } from "../../constants";
import button from "../../UI/button";
import text from "../../UI/text";
import { MapScene } from "../MapScene";
import playerSquad from "./playerSquad";

export async function squadInfo(
  scene: MapScene,
  uiContainer: Phaser.GameObjects.Container,
  baseY: number,
  id: string
): Promise<void> {
  const mapSquad = scene.getMapSquad(id);

  const leader = scene.getSquadLeader(id);

  text(320, baseY, leader.name, uiContainer, scene);

  if (mapSquad.squad.force !== PLAYER_FORCE) {
    button(430, baseY, "Squad Details", scene.uiContainer, scene, () => {
      scene.clearChildrenScenes();
      scene.viewSquadDetails(id);
    });
  }

  if (mapSquad.squad.force === PLAYER_FORCE) {
    playerSquad(scene, baseY, mapSquad, uiContainer);
  }

  // TODO: have all boards loaded, and switch them when clicking
  const boardScene = new StaticBoardScene(
    mapSquad.squad,

    scene.getSquadUnits(id),
    -100,
    480,
    0.4,
    true
  );
  scene.scene.add(`static-squad-${id}`, boardScene, true);
}
