import {preload} from '../../preload';
import {initialState} from './Model';
import {create} from './create';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }
  preload = preload;
  create() {
    create(this, initialState);
  }
}
