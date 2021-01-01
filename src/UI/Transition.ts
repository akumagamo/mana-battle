import * as Phaser from 'phaser';
import panel from '../UI/panel';
import {SCREEN_HEIGHT, SCREEN_WIDTH} from '../constants';

class Transition extends Phaser.Scene {
  create({fadeIn, resolve}: {fadeIn: boolean; resolve: () => void}) {
    const black = panel(
      0,
      0,
      SCREEN_WIDTH,
      SCREEN_HEIGHT,
      this.add.container(),
      this,
    );

    black.setAlpha(fadeIn ? 1 : 0);

    const timeline = this.tweens.createTimeline({
      onComplete: () => {
        this.scene.remove(this);

        resolve();
      },
    });
    timeline.add({
      targets: black,
      alpha: fadeIn ? 0 : 1,
      duration: 500,
    });

    timeline.play();
  }
}

const transition = (scene: Phaser.Scene, fadeIn: boolean) => {
  return new Promise<void>((resolve) =>
    scene.scene.add('transition', Transition, true, {
      resolve: () => resolve(),
      fadeIn,
    }),
  );
};

export const fadeIn = (scene: Phaser.Scene) => transition(scene, true);

export const fadeOut = (scene: Phaser.Scene) => transition(scene, false);
