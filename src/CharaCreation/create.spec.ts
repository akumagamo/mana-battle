import { sceneMock } from '../test/mocks';
import create from './create';

it('should run without crashing', () => create(sceneMock()));
