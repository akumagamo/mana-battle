import { Set } from 'immutable';
import { GAME_SPEED } from '../env';
import { delay } from '../Scenes/utils';
import { fadeIn } from '../UI/Transition';
import { enableInput } from './board/input';
import renderMap from './board/renderMap';
import renderSquads from './board/renderSquads';
import renderStructures from './board/renderStructures';
import { makeWorldDraggable, setWorldBounds } from './dragging';
import destroySquad from './events/destroySquad';
import { MapCommands } from './MapCommands';
import { MapScene } from './MapScene';
import { DEFAULT_MODE } from './Mode';
import { MapState } from './Model';
import signal from './signal';
import pushSquad from './squads/pushSquad';
import subscribe from './subscribe';
import { refreshUI } from './ui';
import update from './update';

export default async (scene: MapScene, state: MapState) => {
  subscribe(scene, state);

  if (process.env.SOUND_ENABLED) {
    scene.sound.stopAll();
    const music = scene.sound.add('map1');

    //@ts-ignore
    music.setVolume(0.3);
    music.play();
  }

  state.mapContainer = scene.add.container(state.mapX, state.mapY);
  state.uiContainer = scene.add.container();
  state.missionContainer = scene.add.container();

  await delay(scene, 100);

  renderMap(scene, state);
  renderStructures(scene, state);
  renderSquads(scene, state);

  await fadeIn(scene, 1000 / GAME_SPEED);

  console.log(state);
  makeWorldDraggable(scene, state);
  setWorldBounds(state);

  await Promise.all(state.squadsToRemove.map((id) => destroySquad(state, id)));
  state.squadsToRemove = Set();

  // if (!scene.hasShownVictoryCondition) {
  //   victoryCondition(scene);
  //   scene.hasShownVictoryCondition = true;
  // }

  await pushSquad(scene, state);

  enableInput(scene, state);
  state.isPaused = false;

  refreshUI(scene, state);

  console.log(state);
  scene.game.events.emit('MapSceneCreated', { scene, state });
  scene.events.on('update', () => {
    update(scene, state);
  });
};
