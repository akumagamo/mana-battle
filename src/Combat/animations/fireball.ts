import { CharaIndex, getChara } from "../../Chara/Model";
import fireball from "../../Chara/animations/spells/fireball";
import { GAME_SPEED } from "../../env";
import damageUnit from "./damageUnit";
import { delay } from "../../Scenes/utils";

export default async function (
  sourceId: string,
  targetId: string,
  damage: number,
  { scene, charaIndex }: { scene: Phaser.Scene; charaIndex: CharaIndex }
) {
  const source = getChara(sourceId, charaIndex);
  const target = getChara(targetId, charaIndex);

  const fireballSprite = fireball(scene, source.container.x, source.container.y);

  fireballSprite.rotation = 1.9;

  if (process.env.SOUND_ENABLED) {
    source.scene.sound.add("fireball").play();
  }

  scene.add.tween({
    targets: fireballSprite,
    x: target.container.x,
    y: target.container.y,
    duration: 700 / GAME_SPEED,
    onComplete: () => {
      fireballSprite.destroy();
      damageUnit(target, damage);
    },
  });

  source.cast();
  await delay(scene, 1000 / GAME_SPEED);
  source.stand();
}
