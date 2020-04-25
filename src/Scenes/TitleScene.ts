import Phaser from 'phaser';
import {getSquads} from '../DB';
import defaultData from '../defaultData';

import {preload} from '../preload';
import button from '../UI/button';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }
  preload = preload;
  create() {
    // dynamic creation of scenes
    //
    this.add.image(0, 0, 'backgrounds/squad_edit');

    const container = this.add.container(0,0);

    button(20, 50, 'List Units', container, this, () => {
      this.scene.transition({
        target: 'ListUnitsScene',
        duration: 0,
        moveBelow: true,
      });
    });

    button(20, 100, 'Edit Squad 0', container, this, () => {
      this.scene.transition({
        target: 'EditSquadScene',
        duration: 0,
        moveBelow: true,
        data: {squad: getSquads()[0]},
      });
    });

    button(20, 150, 'List Squads', container, this, () => {
      this.scene.start('ListSquadsScene');
    });

    button(20, 200, 'Map', container, this, () => {
      this.scene.start('MapScene');
    });

    button(20, 250, 'Combat', container, this, () => {
      this.scene.start('CombatScene',{top:"0",bottom:"3"});
    });

    button(20, 600, 'Erase Data', container, this, () => {
      defaultData();
      alert('Data erased!');
    });

    button(220, 600, 'Go Fullscreen', container, this, () => {
      window.document.body.requestFullscreen();
    });
  }
}
