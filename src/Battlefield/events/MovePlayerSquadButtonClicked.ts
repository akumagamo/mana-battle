import { createEvent } from '../../utils';
import { MapSquad, MapState } from '../Model';

export const key = 'MovePlayerSquadButonClicked';
export default (scene: Phaser.Scene) =>
  createEvent<{
    scene: Phaser.Scene;
    state: MapState;
    mapSquad: MapSquad;
  }>(scene.events, key);
