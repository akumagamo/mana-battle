import text from '../../UI/text';
import { Chara } from '../Model';

const GAME_SPEED = parseInt(process.env.SPEED);
export function displayDamage(chara: Chara, damage: number) {
  const container = chara.scene.add.container(
    chara.container.x,
    chara.container.y
  );
  const dmg = text(-20, -100, damage.toString(), container, chara.scene);
  dmg.setScale(2);
  dmg.setShadow(2, 2, '#000');
  dmg.setStroke('#000000', 4);
  dmg.setAlign('center');
  container.setDepth(Infinity);

  // Phaser bug: onComplete not being executed
  chara.scene.tweens.add({
    targets: dmg,
    y: dmg.y - 20,
    alpha: 0,
    duration: 1500 / GAME_SPEED,
  });
  chara.scene.time.addEvent({
    delay: 1500 / GAME_SPEED,
    callback: () => {
      container.destroy();
      dmg.destroy();
    },
  });
}
