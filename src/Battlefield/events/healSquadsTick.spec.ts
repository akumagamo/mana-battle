import map from '../../maps/green_harbor';
import { getSquadUnits } from '../Model';
import { healSquads } from './healSquadsTick';

it('Should heal injuried units in towns', () => {
  let state = map();

  state = {
    ...state,
    units: state.units.map((u) => {
      if (u.squad === 'squad1') return { ...u, currentHp: 10 };
      return u;
    }),
    squads: state.squads.update('squad1', (sqd) => ({
      ...sqd,
      status: 'guarding_fort',
    })),
  };
  healSquads(state);

  getSquadUnits(state, 'squad1').forEach((u) => {
    expect(u.currentHp).toEqual(18);
  });
});

it('Should not heal injuried units in squads not guarding towns', () => {
  let state = map();

  state = {
    ...state,
    units: state.units.map((u) => {
      if (u.squad === 'squad1') return { ...u, currentHp: 10 };
      return u;
    }),
    squads: state.squads.update('squad1', (sqd) => ({
      ...sqd,
      status: 'moving',
    })),
  };
  healSquads(state);

  getSquadUnits(state, 'squad1').forEach((u) => {
    expect(u.currentHp).toEqual(10);
  });
});
