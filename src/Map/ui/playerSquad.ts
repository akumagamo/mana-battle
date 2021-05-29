import { MapSquad } from "../Model";
import button from "../../UI/button";
import { MapScene } from "../MapScene";
import dispatchWindow from "../dispatchWindow";
import { organize } from "./organize";
import { formationBtn } from "./formationBtn";

export default (
  mapScene: MapScene,
  baseY: number,
  mapSquad: MapSquad,
  uiContainer: Phaser.GameObjects.Container
) => {
  const baseX = 300;
  const mode = mapScene.mode.type;

  if (mode === "SQUAD_SELECTED") {
    button(
      baseX + 300,
      baseY,
      "Formation",
      mapScene.uiContainer,
      mapScene,
      () => {
        mapScene.clearSquadBoards();
        formationBtn(mapScene, mapSquad.id);
      }
    );
    button(baseX + 200, baseY, "Move", mapScene.uiContainer, mapScene, () =>
      mapScene.events.emit("MovePlayerSquadButonClicked", mapScene, mapSquad)
    );
  }

  button(50, 40, "Organize", uiContainer, mapScene, () => {
    mapScene.clearSquadBoards();
    mapScene.turnOff();
    organize(mapScene);
  });
  button(250, 40, "Dispatch", uiContainer, mapScene, () => {
    mapScene.disableMapInput();
    dispatchWindow(mapScene);
  });
};

export function handleMovePlayerSquadButtonClicked(
  mapScene: MapScene,
  mapSquad: MapSquad
) {
  mapScene.changeMode({
    type: "SELECT_SQUAD_MOVE_TARGET",
    id: mapSquad.id,
    start: mapSquad.pos,
  });
}
