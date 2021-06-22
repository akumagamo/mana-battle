import createStaticBoard from "../../Board/createBoard";
import { PLAYER_FORCE } from "../../constants";
import button from "../../UI/button";
import text from "../../UI/text";
import { disableMapInput, enableInput } from "../board/input";
import squadDetails from "../effects/squadDetails";
import { MapScene } from "../MapScene";
import { getMapSquad, getSquadLeader, getSquadUnits } from "../Model";
import playerSquad from "./playerSquad";

/**
 * Rendering text is *very* slow.
 * Removing text we can reduce rendering time from 15ms to 1ms.
 * */
export async function squadInfo(
  scene: MapScene,
  uiContainer: Phaser.GameObjects.Container,
  baseY: number,
  id: string
): Promise<void> {
  const mapSquad = getMapSquad(scene.state, id);

  const leader = getSquadLeader(scene.state, id);

  text(320, baseY, leader.name, uiContainer, scene);

  if (mapSquad.squad.force !== PLAYER_FORCE) {
    button(430, baseY, "Squad Details", scene.uiContainer, scene, () => {
      viewSquadDetails(scene, id);
    });
  }

  if (mapSquad.squad.force === PLAYER_FORCE) {
    playerSquad(scene, baseY, mapSquad);
  }

  const { board } = createStaticBoard(
    scene,
    mapSquad.squad,
    getSquadUnits(scene.state, id),
    170,
    600,
    0.4
  );

  uiContainer.add(board.container);
}

export function viewSquadDetails(scene: MapScene, id: string): void {
  const mapSquad = getMapSquad(scene.state, id);
  disableMapInput(scene);
  squadDetails(
    scene,
    mapSquad,
    scene.state.units.filter((u) => mapSquad.squad.members.has(u.id)),
    () => enableInput(scene)
  );
}
