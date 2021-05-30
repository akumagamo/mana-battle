import panel from "../UI/panel";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../constants";

class Transition extends Phaser.Scene {
  create({
    fadeIn,
    resolve,
    duration,
  }: {
    fadeIn: boolean;
    resolve: () => void;
    duration: number;
  }) {
    const black = panel(
      0,
      0,
      SCREEN_WIDTH,
      SCREEN_HEIGHT,
      this.add.container(),
      this
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
      duration,
    });

    timeline.play();
  }
}

const transition = (scene: Phaser.Scene, fadeIn: boolean, duration: number) => {
  return new Promise<void>((resolve) =>
    scene.scene.add("transition" + Math.random().toString(), Transition, true, {
      resolve: () => resolve(),
      duration,
      fadeIn,
    })
  );
};

export const fadeIn = (scene: Phaser.Scene, duration: number) =>
  transition(scene, true, duration);

export const fadeOut = (scene: Phaser.Scene, duration: number) =>
  transition(scene, false, duration);
