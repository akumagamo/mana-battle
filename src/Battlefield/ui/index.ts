import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../constants';
import { Container } from '../../Models';
import button from '../../UI/button';
import panel from '../../UI/panel';
import text from '../../UI/text';
import { disableMapInput } from '../board/input';
import dispatchWindow from '../dispatchWindow';
import OrganizeButtonClicked from '../events/OrganizeButtonClicked';
import { MapScene } from '../MapScene';
import { MapState } from '../Model';
import turnOff from '../turnOff';
import city from './city';
import { squadInfo } from './squadInfo';

const BOTTOM_PANEL_WIDTH = SCREEN_WIDTH;
const BOTTOM_PANEL_HEIGHT = 80;
const BOTTOM_PANEL_X = 0;
export const BOTTOM_PANEL_Y = SCREEN_HEIGHT - BOTTOM_PANEL_HEIGHT;

export default function ui(
  scene: MapScene,
  state: MapState,
  uiContainer: Container
): Promise<void> {
  // TODO: remove scene (currently we fail to select enemy squad without scene)
  // the parent is already removing (refreshUI)
  const baseY = BOTTOM_PANEL_Y + 25;

  if (state.uiMode.type !== 'SELECT_SQUAD_MOVE_TARGET') {
    button(50, 40, 'Organize', uiContainer, scene, () =>
      OrganizeButtonClicked(scene).emit(scene)
    );
    button(250, 40, 'Dispatch', uiContainer, scene, () => {
      disableMapInput(state);
      state.isPaused = true;
      dispatchWindow(scene, state);
    });

    button(1100, 50, 'Return to Title', uiContainer, scene, () => {
      turnOff(scene, state);
      scene.scene.start('TitleScene');
    });
  }

  if (state.uiMode.type === 'NOTHING_SELECTED') return;

  if (state.uiMode.type !== 'SELECT_SQUAD_MOVE_TARGET')
    panel(
      BOTTOM_PANEL_X,
      BOTTOM_PANEL_Y,
      BOTTOM_PANEL_WIDTH,
      BOTTOM_PANEL_HEIGHT,
      uiContainer,
      scene
    );

  switch (state.uiMode.type) {
    case 'SQUAD_SELECTED':
      return squadInfo(scene, state, uiContainer, baseY, state.uiMode.id);
    case 'CITY_SELECTED':
      return city(scene, state, uiContainer, baseY, state.uiMode.id);
    case 'SELECT_SQUAD_MOVE_TARGET':
      return new Promise(() => {
        panel(SCREEN_WIDTH / 2, 15, 220, 50, uiContainer, scene);
        text(
          SCREEN_WIDTH / 2 + 10,
          24,
          'Select Destination',
          uiContainer,
          scene
        );
      });
    default:
      return;
  }
}

export async function destroyUI(state: MapState) {
  const { uiContainer } = state;
  uiContainer.removeAll(true);
}

export async function refreshUI(scene: MapScene, state: MapState) {
  destroyUI(state);

  if (state.uiMode.type === 'CHANGING_SQUAD_FORMATION') return;

  const { uiContainer } = state;

  ui(scene, state, uiContainer);
}
