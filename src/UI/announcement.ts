import {centerX, centerY} from '../constants';

class Announcement extends Phaser.Scene {
  create({message, resolve}: {message: string; resolve: () => void}) {
    const bg = this.add.image(centerX, centerY, 'announcement_bg');
    const title = this.add.text(centerX, centerY, message, {
      fontSize: '36px',
    });
    title.setOrigin(0.5);
    const timeline = this.tweens.createTimeline({
      onComplete: () => {
        this.scene.remove('announcement');
        resolve();
      },
    });

    bg.setAlpha(0);
    title.setAlpha(0);
    timeline.add({
      targets: [title, bg],
      alpha: 1,
      duration: 500,
    });
    timeline.add({
      targets: [title, bg],
      alpha: 1,
      duration: 500,
    });
    timeline.add({
      targets: [title, bg],
      alpha: 0,
      duration: 1200,
    });
    timeline.play();
  }
}

export default (scene: Phaser.Scene, message: string) => {
  console.log(`CALLING ANNOUNCEMENT`, message);
  return new Promise<void>((resolve) =>
    scene.scene.add('announcement', Announcement, true, {
      message,
      resolve: () => resolve(),
    }),
  );
};
