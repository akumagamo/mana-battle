import { makeUnit } from '../Unit/makeUnit';
import stand from './animations/stand';
import createChara from './createChara';
import hpBar from './ui/hpBar';
import { getMockCalls, sceneMock } from '../test/mocks';

jest.mock('./ui/hpBar');
jest.mock('./animations/stand');

beforeEach(() => {
  (hpBar as jest.Mock).mockClear();
  (stand as jest.Mock).mockClear();
});

it('Should be rendered at the passed position', () => {
  const scene = sceneMock() as any;

  const chara = createChara({
    parent: scene,
    x: 100,
    y: 100,
    unit: makeUnit('fighter', '1', 1),
  });
  expect(chara.container.x).toEqual(100);
  expect(chara.container.y).toEqual(100);
});

it('Should not render a hp bar by default', () => {
  const scene = sceneMock() as any;

  const chara = createChara({
    parent: scene,
    x: 100,
    y: 100,
    unit: makeUnit('fighter', '1', 1),
  });
  expect(getMockCalls(chara.hpBarContainer.add)).toEqual([]);
});

it('Should render a hp bar if argument is present', () => {
  const scene = sceneMock() as any;

  createChara({
    parent: scene,
    x: 100,
    y: 100,
    unit: makeUnit('fighter', 'id1', 1),
    showHpBar: true,
  });

  expect(getMockCalls(hpBar)[0][0].id).toEqual('id1');
  expect(getMockCalls(hpBar)[0][1]).toEqual(80);
});

it('Should be animated by default', () => {
  const scene = sceneMock() as any;

  createChara({
    parent: scene,
    x: 100,
    y: 100,
    unit: makeUnit('fighter', '1', 1),
  });

  expect(toHaveBeenCalledWithFirstParameter(stand).id).toEqual('1');
});
it('Should not be animated if defined by a prop', () => {
  const scene = sceneMock() as any;

  createChara({
    parent: scene,
    x: 100,
    y: 100,
    unit: makeUnit('fighter', '1', 1),
    animated: false,
  });

  shouldNotBeCalled(stand);
});
it('Should be animated if defined by a prop', () => {
  const scene = sceneMock() as any;

  createChara({
    parent: scene,
    x: 100,
    y: 100,
    unit: makeUnit('fighter', '1', 1),
    animated: true,
  });

  expect(toHaveBeenCalledWithFirstParameter(stand).id).toEqual('1');
});

const firstCall = (a: any) => getMockCalls(a)[0];

const calledOnce = (a: any) => getMockCalls(a).length === 1;
const calledAtLeastOnce = (a: any) => getMockCalls(a).length > 0;
const toHaveBeenCalledWithFirstParameter = (a: any) => getMockCalls(a)[0][0];

const shouldNotBeCalled = (a: any) =>
  expect(getMockCalls(a).length === 0).toEqual(true);
