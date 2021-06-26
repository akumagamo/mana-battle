import { Map } from 'immutable';
import { PLAYER_FORCE } from '../../constants';
import map from '../../maps/green_harbor';
import { createSquad } from '../../Squad/Model';
import { sceneMock } from '../../test/mocks';
import { toMapSquad } from '../../Unit/Model';
import { MapState } from '../Model';
import aiAttack from './aiAttack';

it('should get path to closest enemy-controlled city if ATTACK', () => {
  const state = map();

  const stateWithPlayerSquad: MapState = {
    ...state,
    squads: state.squads.set(
      'sqd1',
      toMapSquad(
        createSquad({
          id: 'player',
          members: Map(),
          force: PLAYER_FORCE,
          leader: '',
        }),
        { x: 3, y: 3 }
      )
    ),
  };

  aiAttack(sceneMock(), stateWithPlayerSquad);

  expect(stateWithPlayerSquad.squadsInMovement.get('squad1').path).toEqual([
    { x: 6, y: 3 },
    { x: 5, y: 3 },
    { x: 4, y: 3 },
    { x: 3, y: 3 },
  ]);

  expect(stateWithPlayerSquad.ai.get('squad1')).toEqual('MOVING');
});

it.todo('should return to closest city if squad has less than 50% hp');
