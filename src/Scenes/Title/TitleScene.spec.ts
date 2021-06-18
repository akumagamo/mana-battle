import { sceneMock } from '../../test/mocks';
import storyManager from '../storyManager';
import { create } from './create';
import { initialState } from './Model';
import TitleScene from './TitleScene';

jest.mock('../storyManager', () => jest.fn());

beforeEach(() => {
  (storyManager as jest.Mock).mockClear();
});

it("Should have a 'New Game' option", () => {
  const scene = (sceneMock() as unknown) as TitleScene;
  create(scene, initialState);
});

it.todo("Should start the game when choosing 'New Game'");
