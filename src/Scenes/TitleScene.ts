import Phaser from 'phaser';
import { getSquads } from '../DB';
import defaultData from '../defaultData';

import {preload} from '../preload';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }
  preload = preload
  create() {
    // dynamic creation of scenes
    //
    this.add.image(0,0,"backgrounds/squad_edit")

    const editSquad = this.add.text(10, 100, 'Edit Squad 0', { color: '#fff' });
    editSquad.setInteractive();
    editSquad.on('pointerdown', () => {
      //this.scene.start('EditSquadScene', getSquads()[0]);

      this.scene.transition({
        target: 'EditSquadScene',
        duration: 0,
        moveBelow: true,
        data: {squad: getSquads()[0] }
      })

    });

    const listSquads = this.add.text(10, 200, 'List Squads', { color: '#fff' });
    listSquads .setInteractive();
    listSquads .on('pointerdown', () => {
      this.scene.start('ListSquadsScene');
      //this.scene.remove()
    });

    const erase = this.add.text(10, 600, 'Erase Data');
    erase.setInteractive();
    erase.on('pointerdown', () => {
      defaultData();
      alert("Data erased!")
    });
 
    const fullscreen = this.add.text(200, 600, 'Go Fullscreen');
    fullscreen .setInteractive();
    fullscreen .on('pointerdown', () => {
      window.document.body.requestFullscreen();
    });
  }
}
