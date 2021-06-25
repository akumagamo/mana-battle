import map from '../maps/green_harbor';
import { sceneMock } from '../test/mocks';
import create from './create';
import update from './update';

jest.mock('../Scenes/utils');
jest.mock('./update');
jest.mock('../Squad/ListSquadsScene/ListSquadsScene');

jest.mock('../UI/Transition');

beforeEach(() => {
  (update as jest.Mock).mockReset();
});

it('should create a container for the map', () => {
  const state = map();
  create(sceneMock(), state);

  expect(state.mapContainer).not.toBeNull();
});

it('should create a container for the ui', () => {
  const state = map();
  create(sceneMock(), state);

  expect(state.uiContainer).not.toBeNull();
});
it('should create a container for the mission details', () => {
  const state = map();
  create(sceneMock(), state);

  expect(state.missionContainer).not.toBeNull();
});
it('should not be paused after creation', () => {
  const state = map();
  create(sceneMock(), state);

  expect(state.isPaused).toBeFalsy();
});

it('should communicate that the game that the has started', async () => {
  const scene = sceneMock();
  const state = map();

  await create(scene, state);

  expect(scene.game.events.emit).toBeCalledWith(
    'BattlefieldSceneCreated',
    expect.any(Object)
  );
});
