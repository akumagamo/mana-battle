import initial from "./animations/initial";
import stand from "./animations/stand";
import { Chara } from "./Chara";
import hpBar from "./ui/hpBar";

export default (chara: Chara) => {
  //the unit has two wrappers to allow multiple tweens at once
  chara.charaWrapper = chara.add.container();

  const {
    cx,
    cy,
    headOnly,
    animated,
    showHpBar,
    unit,
    scaleSizing,
  } = chara.props;

  chara.container = chara.add.container(cx, cy);

  chara.charaWrapper.add(chara.container);

  chara.container.setDepth(cy);

  initial(chara, headOnly);

  if (animated) stand(chara);

  const container_width = 100;
  const container_height = 170;

  chara.container.setSize(container_width, container_height);

  // DEBUG DRAG CONTAINER
  //var rect = new Phaser.Geom.Rectangle(
  //  (-1 * container_width) / 2,
  //  (-1 * container_height) / 2,
  //  container_width,
  //  container_height,
  //);
  //
  //var graphics = chara.add.graphics({fillStyle: {color: 0x0000ff}});
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

  // var originGraphic = chara.add.graphics({ fillStyle: { color: 0xff0000 } });
  // originGraphic.alpha = 1;

  // originGraphic.fillRectShape(origin);
  // chara.container.add(originGraphic);

  if (showHpBar) {
    hpBar(chara, unit.currentHp);
  }

  chara.container.scale = scaleSizing;
};
