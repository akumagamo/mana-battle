import createUnit from '../Unit/createUnit';
import createChara from './createChara';
import hpBar from './ui/hpBar';
import {sceneMock} from '../test/mocks';

jest.mock('./ui/hpBar');

beforeEach(() => {
  (hpBar as jest.Mock).mockClear();
});

it('Should be rendered at the passed position', () => {
  const scene = sceneMock() as any;

  const chara = createChara({
    scene: scene,
    x: 100,
    y: 99,
    unit: createUnit(),
  });
  expect(chara.container).toMatchObject({x: 100, y: 99});
});

it('Should not render a hp bar by default', () => {
  const scene = sceneMock() as any;

  const chara = createChara({
    scene: scene,
    x: 100,
    y: 100,
    unit: createUnit(),
  });
  expect(chara.hpBarContainer?.add).not.toHaveBeenCalled();
});

it('Should render a hp bar if argument is present', () => {
  const scene = sceneMock() as any;

  createChara({
    scene: scene,
    x: 100,
    y: 100,
    unit: createUnit(),
    showHpBar: true,
  });

  expect(hpBar).toHaveBeenCalled();
});

it('Should listen to the "selectChara" event', () => {
  const scene = sceneMock() as any;

  const chara = createChara({
    scene: scene,
    unit: createUnit(),
  });

  expect(chara.container.on).toHaveBeenCalledWith(
    'selectChara',
    expect.any(Function),
  );
});
it('Should listen to the "deselectChara" event', () => {
  const scene = sceneMock() as any;

  const chara = createChara({
    scene: scene,
    unit: createUnit(),
  });

  expect(chara.container.on).toHaveBeenCalledWith(
    'deselectChara',
    expect.any(Function),
  );
});
