import { Set } from 'immutable';
import map from '../../maps/green_harbor';
import { sceneMock } from '../../test/mocks';
import button from '../../UI/button';
import panel from '../../UI/panel';
import squadDetails from '../effects/squadDetails';
import { getMapSquad, getSquadLeader, MapState } from '../Model';
import { selectionWindow } from './selectionWindow';

jest.mock('../../UI/button');
jest.mock('../../UI/panel');
const buttonRenderedWithLabel = (button: jest.Mock) => (label: string) =>
  expect(button.mock.calls.some(([x, y, label_]) => label_ === label)).toBe(
    true
  );

const buttonRendered = buttonRenderedWithLabel(button as jest.Mock);

it('should not render anything if squad nor city are in the cell', () => {
  const { state, scene } = given();

  selectionWindow(Set(), scene, state, 3, 3);

  expect(button as jest.Mock).not.toBeCalled();
  expect(panel as jest.Mock).not.toBeCalled();
});

it("should select a squad if there's a squad and no city in the cell", () => {
  const { state, scene } = given();

  selectionWindow(Set(), scene, state, 1, 1);

  expect(button as jest.Mock).not.toBeCalled();
  expect(panel as jest.Mock).not.toBeCalled();
});

it("should select a city if there's no squad and only a city in the cell", () => {
  const { state, scene } = given();

  selectionWindow(Set(), scene, state, 2, 6);

  expect(button as jest.Mock).not.toBeCalled();
  expect(panel as jest.Mock).not.toBeCalled();
});

it("should render a list of squads if there's multiple squads in the cell", () => {
  const { state, scene } = given();

  const updatedSquads = state.squads.map((sqd) => ({
    ...sqd,
    pos: { x: 3, y: 3 },
  }));

  state.squads = updatedSquads;

  selectionWindow(updatedSquads.toSet(), scene, state, 3, 3);

  renderedAllSquads(state);
});

it("should render a list of squads and add the city if there's multiple squads in the cell and a city", () => {
  const { state, scene } = given();

  const updatedSquads = state.squads.map((sqd) => ({
    ...sqd,
    pos: { x: 2, y: 6 },
  }));

  state.squads = updatedSquads;

  selectionWindow(updatedSquads.toSet(), scene, state, 2, 6);

  renderedAllSquads(state);

  buttonRendered('Arabella');

  expect(panel as jest.Mock).toBeCalledTimes(1);
});

function given() {
  const state = map();

  const scene = sceneMock();

  state.uiContainer = scene.add.container();
  return { state, scene };
}

function renderedAllSquads(state: MapState) {
  state.squads.forEach((sqd) => {
    buttonRendered(getSquadLeader(state, sqd.id).name);
  });
}
