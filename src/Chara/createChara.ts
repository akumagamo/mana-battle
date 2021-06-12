import { stringify } from 'querystring';
import initial from './animations/initial';
import stand from './animations/stand';
import { Chara, CharaProps } from './Model';
import hpBar from './ui/hpBar';

//props: CharaProps;

///** Container around Chara, doesn't rotate (useful for adding UI elements)*/
//charaWrapper: Container;
//container: Container;

////body parts

//hair: Image | null = null;
//head: Image | null = null;
//trunk: Image | null = null;
//leftHand: Image | null = null;
//rightHand: Image | null = null;
//leftFoot: Image | null = null;
//rightFoot: Image | null = null;

//mainHandContainer: Container | null = null;
//offHandContainer: Container | null = null;

////Equips
//rightHandEquip: Image | null = null;
//leftHandEquip: Image | null = null;
//hat: Image | null = null;

//hpBarContainer: Container | null;

// constructor({
//   key,
//   parent,
//   unit,
//   cx = 0,
//   cy = 0,
//   scaleSizing = 1,
//   front = true,
//   animated = true,
//   headOnly = false,
//   showHpBar = false,
//   showWeapon = true,
// }: CharaProps) {
//   super(key);

export default (props: CharaProps): Chara => {
  const { x, y, headOnly, animated, showHpBar, unit, scale, parent } = props;
  //the unit has two wrappers to allow multiple tweens at once
  const charaWrapper = parent.add.container();
  const container = parent.add.container(x, y);
  charaWrapper.add(container);

  container.setDepth(y);
  const container_width = 100;
  const container_height = 170;
  container.setSize(container_width, container_height);
  container.setScale(scale);

  const chara: Chara = {
    id: unit.id,
    props,
    scene: parent,
    charaWrapper,
    container,
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
    destroy: () => charaWrapper.destroy(),
  };

  if (showHpBar) {
    hpBar(chara, unit.currentHp);
  }

  initial(chara, headOnly);

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

  return chara;
};
