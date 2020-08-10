import Phaser from 'phaser';
import {getSquads, setSoundEnabled, getOptions, setMusicEnabled} from '../DB';
import defaultData from '../defaultData';
import {preload} from '../preload';
import button from '../UI/button';
import {initialMapState} from '../API/Map/mocks';
import panel from '../UI/panel';
import text from '../UI/text';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
  }
  preload = preload;
  create() {

    this.cameras.main.setBackgroundColor('#000000')
    const container = this.add.container(300, 100);

    button(10, 400, 'Battalion', container, this, ()=>{

      this.cameras.main.fadeOut(1000, 0, 0, 0)

 this.scene.transition({
        target: 'TitleScene',
        duration: 1000,
        moveBelow: true,
   remove: true
      });


    })

    button(210, 400, 'Items', container, this, ()=>{

      container.destroy()

      this.scene.transition({
        target: 'TitleScene',
        duration: 0,
        moveBelow: true,
      });

    })


  }

}
