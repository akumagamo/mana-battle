import { Set } from 'immutable';
import map from '../../maps/green_harbor';
import { sceneMock } from '../../test/mocks';
import button from '../../UI/button';
import panel from '../../UI/panel';
import squadDetails from '../effects/squadDetails';
import { selectionWindow } from './selectionWindow';

jest.mock('../../UI/button');
jest.mock('../../UI/panel');

it("should select a squad if there's no other squad or city in the cell", () => {
  const state = map();

  const scene = sceneMock();

  state.uiContainer = scene.add.container();

  selectionWindow(Set(), scene, state, 1, 1);

  expect(button as jest.Mock).not.toBeCalled();
  expect(panel as jest.Mock).not.toBeCalled();
});

it("should select a city if there's no squad and only a city in the cell", () => {
  // GIVEN
  const state = map();

  const scene = sceneMock();

  state.uiContainer = scene.add.container();

  // WHEN
  selectionWindow(Set(), scene, state, 2, 6);

  // EXPECT
  expect(button as jest.Mock).not.toBeCalled();
  expect(panel as jest.Mock).not.toBeCalled();
});

it("should render a list of squads if there's multiple squads in the cell", () => {
  const state = map();

  const scene = sceneMock();

  state.uiContainer = scene.add.container();

  const updatedSquads = state.squads.map((sqd) => ({
    ...sqd,
    pos: { x: 3, y: 3 },
  }));

  state.squads = updatedSquads;

  selectionWindow(updatedSquads.toSet(), scene, state, 3, 3);

  expect(button as jest.Mock).toBeCalledTimes(2);
  expect(panel as jest.Mock).toBeCalledTimes(1);
});

it("should render a list of squads and add the city if there's multiple squads in the cell and a city", () => {
  const state = map();

  const scene = sceneMock();

  state.uiContainer = scene.add.container();

  const updatedSquads = state.squads.map((sqd) => ({
    ...sqd,
    pos: { x: 2, y: 6 },
  }));

  state.squads = updatedSquads;

  selectionWindow(updatedSquads.toSet(), scene, state, 2, 6);

  expect(button as jest.Mock).toBeCalledTimes(3);

  const renderedCity = (button as jest.Mock).mock.calls.some(
    ([x, y, cityName]) => cityName === 'Arabella'
  );

  expect(renderedCity).toBe(true);

  expect(panel as jest.Mock).toBeCalledTimes(1);
});
