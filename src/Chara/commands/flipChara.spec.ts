import { sceneMock } from '../../test/mocks';
import createUnit from '../../Unit/createUnit';
import createChara from '../createChara';
//import flipChara from './flipChara';

it.skip('should invert the current y scale of the innerwrapper', () => {
  const scene = sceneMock();
  const chara = createChara({ scene, unit: createUnit() });
});

it.todo('should not change the y scale of the main container');