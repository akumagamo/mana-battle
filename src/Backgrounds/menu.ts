import {SCREEN_WIDTH, SCREEN_HEIGHT} from '../constants';

export default (scene: Phaser.Scene) => {
  const bg = scene.add.graphics();
  bg.fillGradientStyle(0x894245, 0x117c8a, 0x117c8a, 0x000000, 1);
  bg.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
};
