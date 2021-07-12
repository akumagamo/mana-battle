const transition = (scene: Phaser.Scene, fadeIn: boolean, duration: number) => {
  return new Promise<void>((resolve) => {
    if (fadeIn) scene.cameras.main.fadeIn(duration);
    else scene.cameras.main.fadeOut(duration);

    scene.time.addEvent({
      delay: duration,
      callback: resolve,
    });
  });
};

export const fadeIn = (scene: Phaser.Scene, duration: number) =>
  transition(scene, true, duration);

export const fadeOut = (scene: Phaser.Scene, duration: number) =>
  transition(scene, false, duration);
