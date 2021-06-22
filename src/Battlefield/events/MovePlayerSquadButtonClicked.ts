import { createEvent } from '../../utils';
import { MapScene } from '../MapScene';
import { MapSquad, MapState } from '../Model';

export const key = 'MovePlayerSquadButonClicked';
export default (scene: Phaser.Scene) =>
  createEvent<{
    mapScene: MapScene;
    state: MapState;
    mapSquad: MapSquad;
  }>(scene.events, key);
