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
import signal from './signal';
import pushSquad from './squads/pushSquad';
import subscribe from './subscribe';
import { refreshUI } from './ui';

export default async (scene: MapScene, data: MapCommands[]) => {
  subscribe(scene);

  scene.mode = DEFAULT_MODE;

  if (process.env.SOUND_ENABLED) {
    scene.sound.stopAll();
    const music = scene.sound.add('map1');

    //@ts-ignore
    music.setVolume(0.3);
    music.play();
  }

  signal(scene, 'startup', data);

  scene.state.mapContainer = scene.add.container(scene.mapX, scene.mapY);
  scene.state.uiContainer = scene.add.container();
  scene.state.missionContainer = scene.add.container();

  await delay(scene, 100);

  renderMap(scene);
  renderStructures(scene);
  renderSquads(scene);

  await fadeIn(scene, 1000 / GAME_SPEED);

  makeWorldDraggable(scene);
  setWorldBounds(scene);

  await Promise.all(scene.squadsToRemove.map((id) => destroySquad(scene, id)));
  scene.squadsToRemove = Set();

  // if (!scene.hasShownVictoryCondition) {
  //   victoryCondition(scene);
  //   scene.hasShownVictoryCondition = true;
  // }

  await pushSquad(scene);

  enableInput(scene);
  scene.isPaused = false;

  refreshUI(scene);
  scene.game.events.emit('MapSceneCreated', scene);
};
