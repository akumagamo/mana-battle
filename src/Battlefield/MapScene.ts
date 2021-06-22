import { Vector, initialBattlefieldState } from './Model';
import { Set } from 'immutable';
import { MapCommands } from './MapCommands';
import preload from './preload';
import update from './update';
import create from './create';

export class MapScene extends Phaser.Scene {
  state = initialBattlefieldState;

  constructor() {
    super('MapScene');
  }

  preload = preload;

  update() {
    update(this);
  }

  create(data: MapCommands[]) {
    create(this, data);
  }
}
