import clickCell from './board/clickCell';
import captureCity from './city/captureCity';
import selectCity from './city/selectCity';
import { MapCommands } from './MapCommands';
import { MapState } from './Model';
import moveCameraTo from './rendering/moveCameraTo';
import { refreshUI } from './ui';
import { viewSquadDetails } from './ui/squadInfo';

export default async function (
  scene: Phaser.Scene,
  state: MapState,
  _eventName: string,
  cmds: MapCommands[]
) {
  await Promise.all(
    cmds.map(async (cmd) => {
      if (cmd.type === 'UPDATE_SQUAD_POS') {
        state.squads = state.squads.update(cmd.id, (sqd) => ({
          ...sqd,
          pos: cmd.pos,
        }));
      } else if (cmd.type === 'UPDATE_UNIT') {
        state.units = state.units.set(cmd.unit.id, cmd.unit);
      } else if (cmd.type === 'CLICK_CELL') {
        if (state.cellClickDisabled) {
          return;
        }

        clickCell(scene, state, cmd.cell);
      } else if (cmd.type === 'MOVE_CAMERA_TO') {
        moveCameraTo(scene, state, { x: cmd.x, y: cmd.y }, cmd.duration);
      } else if (cmd.type === 'VIEW_SQUAD_DETAILS') {
        viewSquadDetails(scene, state, cmd.id);
      } else if (cmd.type === 'REFRESH_UI') {
        refreshUI(scene, state);
      } else if (cmd.type === 'CITY_CLICK') {
        selectCity(scene, state, cmd.id);
      } else if (cmd.type === 'CAPTURE_CITY') {
        captureCity(state, cmd);
      }
    })
  );
}
