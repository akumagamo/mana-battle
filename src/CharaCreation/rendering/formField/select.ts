import { Container } from '../../../Models';
import button from '../../../UI/button';
import text from '../../../UI/text';
import formPanel from '../formPanel';
import { SelectStateModel } from './FormStateModel';

export const baseX = 500;
export const baseY = 50;

export default function selectField(
  scene: Phaser.Scene,
  parent: Container,
  x: number,
  y: number,
  index: number,
  label: string,
  prop: 'hair' | 'skinColor' | 'hairColor',
  items: any[],
  onUnitUpdated: (u: any) => void
) {
  const container = scene.add.container(x, y);
  parent.add(container);

  let initialState = {
    items,
    container,
    prop,
    index,
    label,
    x,
    y,
    scene,
  };

  render(initialState, onUnitUpdated);

  return container;
}

function render(
  state: SelectStateModel,
  onUnitUpdated: (u: { [x: string]: string }) => void
) {
  let { items, container, prop, index, label, x, y, scene } = state;

  formPanel(scene, container, label, 500, 120);
  text(203, 65, (index + 1).toString(), container, scene);

  button(
    20,
    60,
    '<=',
    container,
    scene,
    () => {
      refresh();
      onUnitUpdated({ [prop]: items[index] });
      render(
        { scene, container, label, index: index - 1, prop, items, x, y },
        onUnitUpdated
      );
    },
    index < 1
  );
  button(
    230,
    60,
    '=>',
    state.container,
    scene,
    () => {
      refresh();
      onUnitUpdated({ [prop]: items[index] });
      render(
        { scene, container, label, index: index + 1, prop, items, x, y },
        onUnitUpdated
      );
    },
    index >= items.length - 1
  );

  function refresh() {
    container.removeAll(true);
  }
}
