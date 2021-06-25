import { sceneMock } from '../../test/mocks';
import { makeUnit } from '../../Unit/makeUnit';
import createChara from '../createChara';
//import flipChara from './flipChara';

it.skip('should invert the current y scale of the innerwrapper', () => {
  const scene = sceneMock();
  const chara = createChara({ scene, unit: makeUnit() });
});

it.todo('should not change the y scale of the main container');
