import { Map } from 'immutable';
import plains from '../Backgrounds/plains';
import { Chara } from '../Chara/Chara';
import { Container } from '../Models';
import { preload } from '../preload';
import { fadeOut } from '../UI/Transition';
import { createUnit } from './cmds/createUnit';
import { speak } from './cmds/speak';
import { wait } from './cmds/wait';
import { walk } from './cmds/walk';
import { Answer, question } from './cmds/question';
import { flipUnit } from './cmds/flipUnit';
import { Background, Cmd, SceneConfig } from './Models';

/**
 * This helps us transform a whole scene into a Promise, by injecting a `resolve`
 * into the scene parameters.
 */
export const startTheaterScene = async (
  parent: Phaser.Scene,
  config: SceneConfig
) =>
  new Promise<void>((res) => {
    config.resolve = res;

    parent.scene.start('TheaterScene', config);
  });

export default class TheaterScene extends Phaser.Scene {
  constructor() {
    super('TheaterScene');
  }
  preload = preload;
  charas: Map<string, Chara> = Map();

  container: Container | null = null;
  resolve: () => void | null = null;

  create(data: SceneConfig) {
    this.container = this.add.container();

    this.renderBackground(data.background);
    this.playScript(data.steps, data.resolve);
  }

  async playScript(steps: Cmd[], resolve: (answers: Answer[]) => void) {
    return await steps.reduce(async (prev, step) => {
      const answers = await prev;
      switch (step.type) {
        case 'CREATE_UNIT':
          createUnit(this, step);
          return Promise.resolve(answers);
        case 'WAIT':
          await wait(this, step);
          return Promise.resolve(answers);
        case 'SPEAK':
          await speak(this, step);
          return Promise.resolve(answers);
        case 'WALK':
          await walk(this, step);
          return Promise.resolve(answers);
        case 'FINISH':
          await fadeOut(this);
          this.charas.forEach((c) => this.scene.remove(c));
          this.container.destroy();
          return resolve(answers);
        case 'FLIP':
          flipUnit(this, step);
          return Promise.resolve(answers);
        case 'QUESTION':
          const answer = await question(this, step);
          return Promise.resolve(answers.concat([answer]));
        default:
          return Promise.resolve(answers);
      }
    }, Promise.resolve([] as Answer[]));
  }

  charaKey(id: string): string {
    return `theater_${id}`;
  }

  renderBackground(bg: Background) {
    switch (bg) {
      case 'plains':
        return plains(this, this.container);

      case 'woods':
        return plains(this, this.container);

      case 'castle':
        return this.add.image(0, 0, 'castlebg').setOrigin(0);

      case 'backgrounds/throne_room':
        return this.add.image(0, 0, 'backgrounds/throne_room').setOrigin(0);

      default:
        return plains(this, this.container);
    }
  }
}
