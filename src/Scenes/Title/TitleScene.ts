import { preload } from '../../preload';
import button from '../../UI/button';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../../constants';
import { Chara } from '../../Chara/Model';
import { Container } from '../../Models';
import { makeUnit } from '../../Unit/makeUnit';
import { storyManager } from '../storyManager';
import createChara from '../../Chara/createChara';

export type TitleSceneState = {
  music: Phaser.Sound.BaseSound | null;
  charas: Chara[];
  container: Container | null;
};

const initialState: TitleSceneState = {
  music: null,
  charas: [],
  container: null,
};

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }
  preload = preload;
  create() {
    create(this, initialState);
  }
}

export function handleNewGameClick(
  scene: TitleScene,
  state: TitleSceneState
): void {
  console.log(`clicked`);
  storyManager(scene, state);
  turnOff(scene, state);
}

export function turnOff(scene: TitleScene, state: TitleSceneState) {
  state = initialState;
  scene.scene.stop();
}

function changeMusic(scene: TitleScene, state: TitleSceneState, key: string) {
  if (!process.env.SOUND_ENABLED) return;

  if (state.music) state.music.destroy();

  //    if (getOptions().musicEnabled) {
  state.music = scene.sound.add(key);
  state.music.play();
  //   }
}

export function create(scene: TitleScene, state: TitleSceneState) {
  scene.events.once('shutdown', () => turnOff(scene, state));

  state.container = scene.add.container(0, 0);
  const bg = scene.add.image(0, 0, 'backgrounds/sunset');
  bg.setOrigin(0, 0);
  bg.displayWidth = SCREEN_WIDTH;
  bg.displayHeight = SCREEN_HEIGHT;
  state.container.add(bg);

  state.charas = [
    createChara({
      parent: scene,
      unit: makeUnit('fighter', 3, 1),
      x: 250,
      y: 500,
      scale: 1.3,
      front: false,
      showWeapon: false,
    }),
    createChara({
      parent: scene,
      unit: makeUnit('mage', 1, 1),
      x: 350,
      y: 520,
      scale: 1.5,
      front: false,
      showWeapon: false,
    }),
    createChara({
      parent: scene,
      unit: makeUnit('archer', 2, 1),
      x: 450,
      y: 550,
      scale: 1.6,
      front: false,
      showWeapon: false,
    }),
  ];

  state.charas.forEach((c) => {
    c.container.scaleX = c.container.scaleX * -1;
  });
  state.charas.forEach((c) => state.container.add(c.container));

  changeMusic(scene, state, 'title');

  button(20, 650, 'Go Fullscreen', state.container, scene, () => {
    window.document.body.requestFullscreen();
  });

  button(SCREEN_WIDTH / 2, 550, 'New Game', state.container, scene, () =>
    scene.events.emit('newGameButtonClicked')
  );

  button(SCREEN_WIDTH / 2, 620, 'Options', state.container, scene, () => {
    scene.scene.transition({
      target: 'OptionsScene',
      duration: 0,
      moveBelow: true,
    });
  });

  scene.events.on('newGameButtonClicked', () =>
    handleNewGameClick(scene, state)
  );

  scene.game.events.emit('TitleSceneCreated', scene);
}
