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
    super('OptionsScene');
  }
  preload = preload;
  create() {

    const container = this.add.container(300, 100);

    button(10, 400, 'Return', container, this, ()=>{

      container.destroy()

      this.scene.transition({
        target: 'TitleScene',
        duration: 0,
        moveBelow: true,
      });

    })

    panel(0,0, 400, 300, container, this)

    text(10, 10, 'Sound Enabled', container, this)
    button(310, 10, 'Toggle', container, this, ()=>setSoundEnabled( !getOptions().soundEnabled ))

    text(10, 50, 'Music Enabled', container, this)
    button(310, 50, 'Toggle', container, this, ()=>setMusicEnabled( !getOptions().musicEnabled ))

  }

}
