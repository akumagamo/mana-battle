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

        const enemyUnits = {
          e1: assignSquad({...fighter(0, 10), id: 'e1'}, {id: 'es1', x: 2, y: 2}),
        };

        const enemySquads: MapSquad[] = [
          {
            id: 'es1',
            name: 'Derpy',
            emblem: 'smile',
            members: {e1: {id: 'e1', x: 2, y: 2, leader: true}},
            force: CPU_FORCE,
          },
        ].map((en) => toMapSquad(en, getCity('castle2', map)));

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
                  squads: ['es1'],
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
              mapSquads: [
                toMapSquad(getSquad('1'), getCity('castle1', map)),
              ].concat(enemySquads),
              units: Map(alliedUnits).merge(Map(enemyUnits)),
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
