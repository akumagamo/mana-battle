import Phaser from 'phaser';
import {preload} from '../preload';
import button from '../UI/button';
import maps from '../maps';
import {MapCommands} from './MapScene';
import {toMapSquad} from '../Unit/Model';
import {getCity} from '../API/Map/utils';
import {getSquads, getUnits} from '../DB';
import {Container} from '../Models';
import {MapState} from '../API/Map/Model';
import {fadeIn} from '../UI/Transition';

export default class MapListScene extends Phaser.Scene {
  constructor() {
    super('MapListScene');
  }
  preload = preload;

  create() {
    const bg = this.add.image(0, 0, 'map_select');
    bg.setOrigin(0);
    const container = this.add.container(100, 100);

    maps.forEach((m, i) => this.renderMapListItem(m, i, container));

    fadeIn(this);
  }
  renderMapListItem = (
    map_: () => MapState,
    index: number,
    container: Container,
  ) => {
    const map = map_();
    button(0, index * 100, map.name, container, this, () => {
      this.cameras.main.fadeOut(1000, 0, 0, 0);

      const alliedUnits = getUnits();

      let commands: MapCommands[] = [
        {
          type: 'UPDATE_STATE',
          target: {
            ...map,
            mapSquads: map.mapSquads.concat([
              toMapSquad(
                Object.values(getSquads())[0],
                getCity('castle1', map),
              ),
            ]),
            units: map.units.merge(alliedUnits),
          },
        },
      ];

      this.scene.transition({
        target: 'MapScene',
        duration: 1000,
        moveBelow: true,
        data: commands,
      });
    });
  };
}
