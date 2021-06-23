import { Unit } from "../Unit/Model";
import initial from "./animations/initial";
import stand from "./animations/stand";
import { Chara } from "./Model";
import hpBar from "./ui/hpBar";
import selectChara from "./commands/selectChara";
import deselectChara from "./commands/deselectChara";

export default (props: {
  parent: Phaser.Scene;
  unit: Unit;
  x?: number;
  y?: number;
  scale?: number;
  front?: boolean;
  animated?: boolean;
  headOnly?: boolean;
  showHpBar?: boolean;
  showWeapon?: boolean;
}): Chara => {
  const {
    parent,
    unit,
    x = 0,
    y = 0,
    scale = 1,
    front = true,
    animated = true,
    headOnly = false,
    showHpBar = false,
    showWeapon = false,
  } = props;
  //the unit has two wrappers to allow multiple tweens at once
  const container = parent.add.container(x, y);
  container.name = unit.id;

  const charaWrapper = parent.add.container();
  container.add(charaWrapper);

  container.setDepth(y);
  const container_width = 100;
  const container_height = 170;
  container.setSize(container_width, container_height);
  container.setScale(scale);

  const chara: Chara = {
    id: unit.id,
    props: {
      ...props,
      x,
      y,
      scale,
      front,
      animated,
      headOnly,
      showHpBar,
      showWeapon,
    },
    scene: parent,
    container,
    innerWrapper: charaWrapper,
    hpBarContainer: parent.add.container(),

    hair: null,
    head: null,
    trunk: null,
    leftHand: null,
    rightHand: null,
    leftFoot: null,
    rightFoot: null,

    mainHandContainer: null,
    offHandContainer: null,

    rightHandEquip: null,
    leftHandEquip: null,
    hat: null,
    selectedCharaIndicator: null,
    destroy: () => {
      container.destroy();
    }, //todo: make this an external function. check other destroy fns
    events: {
      select: () => container.emit("selectChara"),
      deselect: () => container.emit("deselectChara"),
    },
  };

  initial(chara, headOnly);

  if (showHpBar) {
    hpBar(chara, unit.currentHp);
  }

  if (animated) stand(chara);

  // DEBUG DRAG CONTAINER
  //var rect = new Phaser.Geom.Rectangle(
  //  (-1 * container_width) / 2,
  //  (-1 * container_height) / 2,
  //  container_width,
  //  container_height,
  //);
  //
  //var graphics = chara.scene.add.graphics({fillStyle: {color: 0x0000ff}});
  //graphics.alpha = 0.5;
  //
  //graphics.fillRectShape(rect);
  //chara.container.add(graphics);
  //
  // DEBUG ORIGIN
  // var origin = new Phaser.Geom.Rectangle(
  //   0,
  //   0,
  //   20,
  //   20
  // );

  // var originGraphic = chara.scene.add.graphics({ fillStyle: { color: 0xff0000 } });
  // originGraphic.alpha = 1;

  // originGraphic.fillRectShape(origin);
  // chara.container.add(originGraphic);

  container.on("selectChara", () => {
    selectChara(chara);
  });

  container.on("deselectChara", () => {
    deselectChara(chara);
  });

  return chara;
};
