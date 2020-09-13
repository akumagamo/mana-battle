import Phaser from 'phaser';
import {preload} from '../preload';
import button from '../UI/button';
import maps from '../maps';
import {MapCommands} from './MapScene';
import {CPU_FORCE, PLAYER_FORCE} from '../API/Map/Model';
import {makeMapSquad} from '../Unit/Model';
import {getCity} from '../API/Map/utils';

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

        let commands: MapCommands[] = [
          {
            type: 'UPDATE_STATE',
            target: {
              ...map,
              forces: [
                {
                  id: PLAYER_FORCE,
                  name: 'Player',
                  squads: ['1'],
                  relations: {[CPU_FORCE]: 'hostile'},
                  initialPosition: 'castle1',
                },
                {
                  id: CPU_FORCE,
                  name: 'Computer',
                  squads: ['2'],
                  relations: {[PLAYER_FORCE]: 'hostile'},
                  initialPosition: 'castle2',
                },
              ],
              cities: map.cities.map((city) => {
                //TODO: change map model so that each force has a starting city id
                if (city.id === 'castle1')
                  return {...city, force: PLAYER_FORCE};

                if (city.id === 'castle2') return {...city, force: CPU_FORCE};

                return city;
              }),
              squads: [
                makeMapSquad(1, PLAYER_FORCE, getCity('castle1',map)),
                makeMapSquad(2, CPU_FORCE, getCity('castle2',map)),
              ],
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
