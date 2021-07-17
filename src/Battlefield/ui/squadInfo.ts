import createStaticBoard from "../../Board/createBoard";
import { PLAYER_FORCE } from "../../constants";
import button from "../../UI/button";
import text from "../../UI/text";
import { disableMapInput, enableMapInput } from "../board/input";
import squadDetails from "../effects/squadDetails";
import { getMapSquad, getSquadLeader, getSquadUnits, MapState } from "../Model";
import playerSquad from "./playerSquad";

export async function squadInfo(
  scene: Phaser.Scene,
  state: MapState,
  uiContainer: Phaser.GameObjects.Container,
  baseY: number,
  id: string
): Promise<void> {
  const mapSquad = getMapSquad(state, id);

  const leader = getSquadLeader(state, id);

  text(320, baseY, leader.name, uiContainer, scene);

  if (mapSquad.squad.force !== PLAYER_FORCE) {
    button(430, baseY, "Squad Details", state.uiContainer, scene, () => {
      viewSquadDetails(scene, state, id);
    });
  }

  if (mapSquad.squad.force === PLAYER_FORCE) {
    playerSquad(scene, state, baseY, mapSquad);
  }

  const { board } = createStaticBoard(
    scene,
    mapSquad.squad,
    getSquadUnits(state, id),
    170,
    600,
    0.4
  );

  uiContainer.add(board.container);
}

export function viewSquadDetails(
  scene: Phaser.Scene,
  state: MapState,
  id: string
): void {
  const mapSquad = getMapSquad(state, id);
  disableMapInput(state);
  state.isPaused = true;
  squadDetails(
    scene,
    mapSquad,
    state.units.filter((u) => mapSquad.squad.members.has(u.id)),
    () => {
      enableMapInput(scene, state);
      state.isPaused = false;
    }
  );
}
