import { MapSquad, MapState } from "../Model";
import button from "../../UI/button";
import EditSquadModal from "../../Squad/EditSquadModal/createEditSquadModal";
import MovePlayerSquadButtonClicked from "../events/MovePlayerSquadButtonClicked";
import { disableMapInput, enableMapInput } from "../board/input";
import { changeMode } from "../Mode";
import { createUnitSquadIndex } from "../../Squad/Model";

export default (
  scene: Phaser.Scene,
  state: MapState,
  baseY: number,
  mapSquad: MapSquad
) => {
  const baseX = 300;
  const mode = state.uiMode.type;

  if (mode === "SQUAD_SELECTED") {
    button(baseX + 200, baseY, "Move", state.uiContainer, scene, () =>
      MovePlayerSquadButtonClicked(scene).emit({ scene, state, mapSquad })
    );
    button(baseX + 420, baseY, "Formation", state.uiContainer, scene, () => {
      changeMode(scene, state, { type: "CHANGING_SQUAD_FORMATION" });
      disableMapInput(state);

      EditSquadModal({
        scene,
        squad: mapSquad.squad,
        units: state.units,
        unitSquadIndex: createUnitSquadIndex(state.squads.map((s) => s.squad)),
        addUnitEnabled: false,
        onSquadUpdated: (updatedSquad) => {
          state.squads = state.squads.setIn(
            [mapSquad.id, "squad"],
            updatedSquad
          );
        },
        onClose: () => {
          enableMapInput(scene, state);
          changeMode(scene, state, {
            type: "SQUAD_SELECTED",
            id: mapSquad.squad.id,
          });
        },
      });
    });
  }
};

export function handleMovePlayerSquadButtonClicked({
  mapSquad,
  state,
  scene,
}: {
  scene: Phaser.Scene;
  state: MapState;
  mapSquad: MapSquad;
}) {
  changeMode(scene, state, {
    type: "SELECT_SQUAD_MOVE_TARGET",
    id: mapSquad.id,
    start: mapSquad.posScreen,
  });
  state.isPaused = true;
}
