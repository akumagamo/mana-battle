export const delay = (scene: Phaser.Scene, delay: number) => {
  return new Promise<void>((callback) =>
    scene.time.addEvent({
      delay,
      callback,
    }),
  );
};

export const tween = (scene: Phaser.Scene, options: any) => {
  return new Promise<void>((resolve) =>
    scene.tweens.add({
      ...options,
      onComplete: resolve,
    }),
  );
};
