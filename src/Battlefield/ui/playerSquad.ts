import { MapSquad } from "../Model";
import button from "../../UI/button";
import { MapScene } from "../MapScene";
import EditSquadModal from "../../Squad/EditSquadModal/createEditSquadModal";
import MovePlayerSquadButtonClicked from "../events/MovePlayerSquadButtonClicked";
import { disableMapInput, enableInput } from "../board/input";
import signal from "../signal";
import { changeMode } from "../Mode";

export default (mapScene: MapScene, baseY: number, mapSquad: MapSquad) => {
  const baseX = 300;
  const mode = mapScene.mode.type;

  if (mode === "SQUAD_SELECTED") {
    button(
      baseX + 400,
      baseY,
      "Formation",
      mapScene.uiContainer,
      mapScene,
      () => {
        changeMode(mapScene, { type: "CHANGING_SQUAD_FORMATION" });
        disableMapInput(mapScene);

        EditSquadModal({
          scene: mapScene,
          squad: mapSquad.squad,
          units: mapScene.state.units,
          addUnitEnabled: false,
          onSquadUpdated: (updatedSquad) => {
            signal(mapScene, "changed unit position on board, updating", [
              {
                type: "UPDATE_STATE",
                target: {
                  ...mapScene.state,
                  squads: mapScene.state.squads.set(mapSquad.id, {
                    ...mapScene.state.squads.get(mapSquad.id),
                    squad: updatedSquad,
                  }),
                },
              },
            ]);
          },
          onClose: () => {
            enableInput(mapScene);
            changeMode(mapScene, {
              type: "SQUAD_SELECTED",
              id: mapSquad.squad.id,
            });
          },
        });
      }
    );
    button(baseX + 200, baseY, "Move", mapScene.uiContainer, mapScene, () =>
      MovePlayerSquadButtonClicked(mapScene).emit({ mapScene, mapSquad })
    );
  }
};

export function handleMovePlayerSquadButtonClicked({
  mapSquad,
  mapScene,
}: {
  mapScene: MapScene;
  mapSquad: MapSquad;
}) {
  changeMode(mapScene, {
    type: "SELECT_SQUAD_MOVE_TARGET",
    id: mapSquad.id,
    start: mapSquad.pos,
  });
  mapScene.isPaused = true;
}
