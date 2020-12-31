import {centerX, centerY} from '../constants';

class Announcement extends Phaser.Scene {
  create({message, resolve}: {message: string; resolve: () => void}) {
    const bg = this.add.image(centerX, centerY, 'announce_bg');
    const title = this.add.text(centerX, centerY, message, {
      fontSize: '36px',
    });
    title.setOrigin(0.5);
    const timeline = this.tweens.createTimeline({
      onComplete: () => {
        resolve();
        this.scene.remove('annoucement');
      },
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
  return new Promise<void>((resolve) =>
    scene.scene.add('annoucement', Announcement, true, {
      message,
      resolve: () => resolve(),
    }),
  );
};
