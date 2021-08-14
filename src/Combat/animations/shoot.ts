import { CharaIndex, getChara } from "../../Chara/Model";
import { GAME_SPEED } from "../../env";
import { delay } from "../../Scenes/utils";
import damageUnit from "./damageUnit";

export default async function shoot(
  sourceId: string,
  targetId: string,
  newHp: number,
  damage: number,
  { scene, charaIndex }: { scene: Phaser.Scene; charaIndex: CharaIndex }
) {
  const source = getChara(sourceId, charaIndex);
  const target = getChara(targetId, charaIndex);

  const arrow = scene.add.image(
    source.container.x,
    source.container.y,
    "arrow"
  );

  arrow.rotation = 0.5;

  scene.add.tween({
    targets: arrow,
    x: target.container?.x,
    y: target.container?.y,
    duration: 250 / GAME_SPEED,
    onComplete: () => {
      damageUnit(target, newHp, damage);
      arrow.destroy();
    },
  });

  source.cast();

  await delay(scene, 1000 / GAME_SPEED);

  source.stand();
}
