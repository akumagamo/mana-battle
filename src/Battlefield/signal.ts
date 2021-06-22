import clickCell from "./board/clickCell";
import captureCity from "./city/captureCity";
import selectCity from "./city/selectCity";
import { MapCommands } from "./MapCommands";
import { MapScene } from "./MapScene";
import { updateState } from "./Model";
import moveCameraTo from "./rendering/moveCameraTo";
import markSquadForRemoval from "./squads/markSquadForRemoval";

export default async function (
  scene: MapScene,
  _eventName: string,
  cmds: MapCommands[]
) {
  await Promise.all(
    cmds.map(async (cmd) => {
      if (cmd.type === "DESTROY_TEAM") {
        markSquadForRemoval(scene, cmd.target);
      } else if (cmd.type === "UPDATE_STATE") {
        updateState(scene, cmd.target);
      } else if (cmd.type === "UPDATE_SQUAD_POS") {
        scene.state.squads = scene.state.squads.update(cmd.id, (sqd) => ({
          ...sqd,
          pos: cmd.pos,
        }));
      } else if (cmd.type === "UPDATE_UNIT") {
        scene.state.units = scene.state.units.set(cmd.unit.id, cmd.unit);
      } else if (cmd.type === "CLICK_CELL") {
        if (scene.cellClickDisabled) {
          return;
        }

        clickCell(scene, cmd.cell);
      } else if (cmd.type === "MOVE_CAMERA_TO") {
        moveCameraTo(scene, { x: cmd.x, y: cmd.y }, cmd.duration);
      } else if (cmd.type === "CLEAR_TILES_EVENTS") {
        scene.clearAllTileEvents();
      } else if (cmd.type === "CLEAR_TILES_TINTING") {
        scene.clearAllTileTint();
      } else if (cmd.type === "VIEW_SQUAD_DETAILS") {
        scene.viewSquadDetails(cmd.id);
      } else if (cmd.type === "REFRESH_UI") {
        scene.refreshUI();
      } else if (cmd.type === "CITY_CLICK") {
        selectCity(scene, cmd.id);
      } else if (cmd.type === "CAPTURE_CITY") {
        captureCity(scene, cmd);
      } else if (cmd.type === "PUSH_SQUAD") {
        scene.squadToPush = cmd;
      }
    })
  );
}
