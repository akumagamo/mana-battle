import { Set } from 'immutable';
import { GAME_SPEED } from '../env';
import { delay } from '../Scenes/utils';
import { fadeIn } from '../UI/Transition';
import { enableMapInput } from './board/input';
import renderMap from './board/renderMap';
import renderSquads from './board/renderSquads';
import renderStructures from './board/renderStructures';
import { makeWorldDraggable, setWorldBounds } from './dragging';
import destroySquad from './events/destroySquad';
import { MapState } from './Model';
import pushSquad from './squads/pushSquad';
import subscribe from './subscribe';
import { refreshUI } from './ui';
import update from './update';

export default async (scene: Phaser.Scene, state: MapState) => {
  subscribe(scene, state);

  scene.events.on('update', () => {
    update(scene, state);
  });

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

  renderMap(scene, state);
  renderStructures(scene, state);
  renderSquads(scene, state);

  await fadeIn(scene, 1000 / GAME_SPEED);

  makeWorldDraggable(scene, state);
  setWorldBounds(state);

  await Promise.all(state.squadsToRemove.map((id) => destroySquad(state, id)));
  state.squadsToRemove = Set();

  // if (!scene.hasShownVictoryCondition) {
  //   victoryCondition(scene);
  //   scene.hasShownVictoryCondition = true;
  // }

  await pushSquad(scene, state);

  enableMapInput(scene, state);
  state.isPaused = false;

  refreshUI(scene, state);

  scene.game.events.emit('BattlefieldSceneCreated', { scene, state });
};
