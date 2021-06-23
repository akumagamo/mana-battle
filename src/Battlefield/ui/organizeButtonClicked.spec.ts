import { organizeButtonClicked } from './organizeButtonClicked';
import { run } from '../../Squad/ListSquadsScene/ListSquadsScene';
import map from '../../maps/green_harbor';
import { getMockCalls, sceneMock } from '../../test/mocks';
import { CPU_FORCE, PLAYER_FORCE } from '../../constants';
import { toMapSquad, Unit } from '../../Unit/Model';
import { Map, Set } from 'immutable';
import { makeUnit } from '../../Unit/makeUnit';
import { createSquad, makeMember, SquadRecord } from '../../Squad/Model';
import squadDetails from '../effects/squadDetails';
import { MapSquad } from '../Model';

jest.mock('../../Squad/ListSquadsScene/ListSquadsScene');

const defaultProps = () => ({
  turnOff: jest.fn(),
  state: {
    ...map(),
    units: map().units.set('ally1', {
      ...makeUnit({ id: 'ally1' }),
      force: PLAYER_FORCE,
    }),
    dispatchedSquads: Set(['ally_squad']),
    squads: map().squads.set(
      'ally_squad',
      toMapSquad(
        {
          ...createSquad({
            id: 'ally_squad',
            members: Map({
              ally1: makeMember({ id: 'ally1', x: 1, y: 1 }),
            }),
            leader: 'ally1',
            force: PLAYER_FORCE,
          }),
        },
        { x: 1, y: 1 },
        0
      )
    ),
  },
  scene: sceneMock(),
});

beforeEach(() => {
  //@ts-ignore
  run.mockClear();
});

it('should start ListSquadScene when clicked', () => {
  organizeButtonClicked(defaultProps(), () => {});
  expect(getMockCalls(run).length).toEqual(1);
});

it('should stop MapScene when clicked', () => {
  const props = defaultProps();

  organizeButtonClicked(props, () => {});

  expect(getMockCalls(props.turnOff).length).toEqual(1);
});

it('should only pass units owned by the player to ListSquadScene', () => {
  const props = defaultProps();

  expect(
    props.state.units.filter((u) => u.force === CPU_FORCE).size
  ).toBeGreaterThan(0);

  organizeButtonClicked(props, () => {});

  const unitsProvided = getMockCalls(run)[0][0].units as Map<string, Unit>;
  expect(
    unitsProvided.filter((u) => u.force === CPU_FORCE).size
  ).toBeLessThanOrEqual(0);
  expect(
    unitsProvided.filter((u) => u.force === PLAYER_FORCE).size
  ).toBeGreaterThan(0);
});

it('should only pass squads owned by the player to ListSquadScene', () => {
  const props = defaultProps();

  expect(
    props.state.squads.filter((sqd) => sqd.squad.force === CPU_FORCE).size
  ).toBeGreaterThan(0);

  organizeButtonClicked(props, () => {});

  const squadsProvided = getMockCalls(run)[0][0].units as Map<
    string,
    SquadRecord
  >;
  expect(
    squadsProvided.filter((squad) => squad.force === CPU_FORCE).size
  ).toBeLessThanOrEqual(0);
  expect(
    squadsProvided.filter((squad) => squad.force === PLAYER_FORCE).size
  ).toBeGreaterThan(0);
});
it('should pass the dispatched squads id to ListSquadScene', () => {
  const props = defaultProps();

  organizeButtonClicked(props, () => {});

  const dispatched = getMockCalls(run)[0][0].dispatched as Set<string>;

  expect(dispatched.toJS()).toStrictEqual(['ally_squad']);
});
