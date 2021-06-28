import { Container } from '../../../Models';
import button from '../../../UI/button';
import { BTN_MARGIN } from '../config';
import formPanel from '../formPanel';

const classBtnSize = 170;
export default function createRadio(
  scene: Phaser.Scene,
  parent: Container,
  x: number,
  y: number,
  width: number,
  label: string,
  prop: 'class' | 'gender',
  items: string[],
  labelIndex: { [id: string]: string },
  onUnitUpdated: any
) {
  const container = scene.add.container(x, y);
  parent.add(container);
  render(
    scene,
    container,
    width,
    labelIndex,
    prop,
    label,
    items,
    items[0],
    onUnitUpdated
  );
}

const render = (
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  width: number,
  labelIndex: { [x: string]: string },
  prop: string,
  label: string,
  items: any[],
  selected: string,
  onUnitUpdated: any
) => {
  const panel_ = formPanel(scene, container, label, width, 100);
  const btns = items.map((g, i) =>
    renderBtn(
      scene,
      container,
      width,
      labelIndex,
      prop,
      g,
      i,
      selected,
      items,
      onUnitUpdated
    )
  );
};

const renderBtn = (
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  width: number,
  labelIndex: { [x: string]: string },
  prop: any,
  value: string,
  i: number,
  selected: string,
  items: any[],
  onUnitUpdated: any
) => {
  return button(
    BTN_MARGIN * i + i * classBtnSize + 20,
    50,
    labelIndex[value],
    container,
    scene,
    () => {
      clear(container);
      onUnitUpdated(prop, value);
      render(
        scene,
        container,
        width,
        labelIndex,
        prop,
        labelIndex[value],
        items,
        items[i],
        onUnitUpdated
      );
    },
    false,
    classBtnSize,
    0,
    value === selected
  );
};

function clear(container: Container) {
  container.removeAll(true);
}
