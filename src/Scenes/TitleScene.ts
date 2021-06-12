import Phaser from 'phaser';
import { preload } from '../preload';
import button from '../UI/button';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../constants';
import { Chara } from '../Chara/Model';
import { Container } from '../Models';
import { fadeOut } from '../UI/Transition';
import { makeUnit } from '../Unit/makeUnit';
import { storyManager } from './storyManager';
import createChara from '../Chara/createChara';

const GAME_SPEED = parseInt(process.env.SPEED);

export default class TitleScene extends Phaser.Scene {
  music: Phaser.Sound.BaseSound | null = null;
  charas: Chara[] = [];
  container: Container | null = null;
  sceneEvents = {
    NewGameButtonClicked: this.handleNewGameClick.bind(this),
  };
  constructor() {
    super('TitleScene');
  }
  preload() {
    preload.bind(this)();
  }

  create() {
    this.events.once('shutdown', () => this.turnOff());

    this.container = this.add.container(0, 0);
    const bg = this.add.image(0, 0, 'backgrounds/sunset');
    bg.setOrigin(0, 0);
    bg.displayWidth = SCREEN_WIDTH;
    bg.displayHeight = SCREEN_HEIGHT;
    this.container.add(bg);

    this.charas = [
      createChara({
        parent: this,
        unit: makeUnit('fighter', 3, 1),
        x: 250,
        y: 500,
        scale: 1.3,
        front: false,
        showWeapon: false,
      }),
      createChara({
        parent: this,
        unit: makeUnit('mage', 1, 1),
        x: 350,
        y: 520,
        scale: 1.5,
        front: false,
        showWeapon: false,
      }),
      createChara({
        parent: this,
        unit: makeUnit('archer', 2, 1),
        x: 450,
        y: 550,
        scale: 1.6,
        front: false,
        showWeapon: false,
      }),
    ];

    this.charas.forEach((c) => {
      c.container.scaleX = c.container.scaleX * -1;
    });
    this.charas.forEach((c) => this.container?.add(c.container));

    this.changeMusic('title');

    button(20, 650, 'Go Fullscreen', this.container, this, () => {
      window.document.body.requestFullscreen();
    });

    button(
      SCREEN_WIDTH / 2,
      550,
      'New Game',
      this.container,
      this,
      this.sceneEvents.NewGameButtonClicked.bind(this)
    );

    button(SCREEN_WIDTH / 2, 620, 'Options', this.container, this, () => {
      this.scene.transition({
        target: 'OptionsScene',
        duration: 0,
        moveBelow: true,
      });
    });

    // TODO: receive event listener as prop - GameEvents?
    this.game.events.emit('TitleSceneCreated', this);
  }

  handleNewGameClick() {
    storyManager(this);
  }
  private changeMusic(key: string) {
    if (!process.env.SOUND_ENABLED) return;

    if (this.music) this.music.destroy();

    //    if (getOptions().musicEnabled) {
    this.music = this.sound.add(key);
    this.music.play();
    //   }
  }

  async mapsEvent() {
    await fadeOut(this, 1000 / GAME_SPEED);
    this.scene.start('MapListScene');
  }

  turnOff() {
    this.charas.map((c) => c.destroy());
    this.charas = [];
    this.container?.destroy();
    this.scene.stop();
  }
}
