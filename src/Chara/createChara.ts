import { Unit } from "../Unit/Model";
import { Chara } from "./Model";
import hpBar from "./ui/hpBar";
import * as selectChara from "./commands/selectChara";
import * as deselectChara from "./commands/deselectChara";
import animations from "./animations/animations";

export default (props: {
  scene: Phaser.Scene;
  unit: Unit;
  x?: number;
  y?: number;
  scale?: number;
  animated?: boolean;
  showHpBar?: boolean;
}): Chara => {
  const { scene, unit, x = 0, y = 0, scale = 1, showHpBar = false } = props;

  const container = scene.add.container(x, y);
  container.setSize(100, 75);
  const sprite = scene.add.sprite(0, 0, `sprite_${unit.job}`);
  sprite.setScale(scale);

  const hpBarContainer = scene.add.container();
  container.add([sprite, hpBarContainer]);

  const chara: Chara = {
    scene,
    sprite,
    id: unit.id,
    unit,
    container,
    x,
    y,
    scale,
    showHpBar,
    hpBarContainer,

    stand: () => {
      sprite.play("stand");
    },
    run: () => {
      sprite.play("run");
    },
    cast: () => {
      sprite.play("cast");
    },
    hit: () => {
      sprite.play("hit");
    },
    die: () => {
      sprite.play("die");
    },
    tint: (value: number) => {
      sprite.setTint(value);
    },
    destroy: () => {
      sprite.destroy();
      container.destroy();
    },
    selectedCharaIndicator: null,
  };

  if (showHpBar) {
    hpBar(chara, unit.currentHp);
  }

  animations(scene)

  selectChara.subscribe(chara);
  deselectChara.subscribe(chara);

  return chara;
};
