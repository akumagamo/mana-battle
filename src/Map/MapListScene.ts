import Phaser from 'phaser';
import {preload} from '../preload';
import button from '../UI/button';
import maps from '../maps';
import {MapCommands} from './MapScene';
import {CPU_FORCE, MapSquad, PLAYER_FORCE} from '../API/Map/Model';
import {assignSquad, toMapSquad, Unit} from '../Unit/Model';
import {getCity} from '../API/Map/utils';
import {getSquad, getUnit, getUnits} from '../DB';
import {fighter} from '../Unit/Jobs';
import {Map, List} from 'immutable';
import {Squad} from '../Squad/Model';

export default class MapListScene extends Phaser.Scene {
  constructor() {
    super('MapListScene');
  }
  preload = preload;
  create() {
    const container = this.add.container(100, 100);

    maps.forEach((map, index) => {
      button(0, index * 100, map.name, container, this, () => {
        this.cameras.main.fadeOut(1000, 0, 0, 0);

        const alliedUnits = getUnits();

        let commands: MapCommands[] = [
          {
            type: 'UPDATE_STATE',
            target: {
              ...map,
              mapSquads: map.mapSquads.concat([ toMapSquad(getSquad('1'), getCity('castle1', map))]),
              units: map.units.merge(alliedUnits),
            },
          },
        ];

        this.scene.transition({
          target: 'MapScene',
          duration: 1000,
          moveBelow: true,
          remove: true,
          data: commands,
        });
      });
    });
  }
}
