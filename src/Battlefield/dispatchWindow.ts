import { PLAYER_FORCE, SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import { SquadRecord } from '../Squad/Model';
import button from '../UI/button';
import panel from '../UI/panel';
import text from '../UI/text';
import { toMapSquad } from '../Unit/Model';
import { enableMapInput } from './board/input';
import { renderSquad } from './board/renderSquads';
import DispatchWindowRendered from './events/DispatchWindowRendered';
import SquadClicked from './events/SquadClicked';
import SquadDispatched from './events/SquadDispatched';
import { changeMode } from './Mode';
import {
  getCity,
  getForce,
  getForceSquads,
  getMapSquad,
  getSquadLeader,
  MapSquad,
  MapState,
} from './Model';
import signal from './signal';

export default (scene: Phaser.Scene, state: MapState) => {
  let container = scene.add.container();

  const x = SCREEN_WIDTH / 4;
  const y = SCREEN_HEIGHT * 0.1;

  const width = SCREEN_WIDTH / 2;
  const height = SCREEN_HEIGHT * 0.7;

  const padding = 40;

  panel(x, y, width, height, container, scene);

  const title = text(
    SCREEN_WIDTH / 2,
    y + 20,
    'Select squad to dispatch',
    container,
    scene
  );
  title.setOrigin(0.5);
  title.setFontSize(24);

  const close = scene.add.image(x + width, y, 'close_btn');
  container.add(close);
  close.setOrigin(0.5);
  close.setScale(0.7);
  close.setInteractive();
  close.on('pointerup', () => {
    container.destroy();
    enableMapInput(scene, state);
  });

  let squadsToRender = getForceSquads(state, PLAYER_FORCE).filter(
    (mapSquad) =>
      mapSquad.status !== 'defeated' &&
      !state.dispatchedSquads.has(mapSquad.squad.id)
  );

  squadsToRender.toList().forEach((mapSquad, i) => {
    const leader = getSquadLeader(state, mapSquad.id);
    button(
      x + padding,
      y + 60 + 70 * i,
      leader.name,
      container,
      scene,
      () => handleDispatchSquad(container, scene, state, mapSquad),
      false,
      width - padding * 2
    );
  });

  DispatchWindowRendered(scene).emit({
    container,
    scene,
    squads: squadsToRender,
  });
};

export const handleDispatchSquad = async (
  container: Phaser.GameObjects.Container,
  scene: Phaser.Scene,
  state: MapState,
  mapSquad: MapSquad
) => {
  container.destroy();

  dispatchSquad(scene, state, mapSquad.squad);
  enableMapInput(scene, state);
  state.isPaused = false;
  changeMode(scene, state, { type: 'SQUAD_SELECTED', id: mapSquad.squad.id });

  let squad = getMapSquad(state, mapSquad.squad.id);
  SquadClicked(scene).emit(squad);
  signal(scene, state, 'clicked dispatch squad button', [
    {
      type: 'MOVE_CAMERA_TO',
      x: squad.posScreen.x,
      y: squad.posScreen.y,
      duration: 500,
    },
  ]);

  SquadDispatched(scene).emit(mapSquad.id);
};

function dispatchSquad(
  scene: Phaser.Scene,
  state: MapState,
  squad: SquadRecord
) {
  const force = getForce(state, PLAYER_FORCE);
  if(!force) return;
  let mapSquad = toMapSquad(
    squad,
    getCity(state, force.initialPosition),
  );

  state.dispatchedSquads = state.dispatchedSquads.add(squad.id);

  force.squads.push(squad.id);

  renderSquad(scene, state, mapSquad);
}
