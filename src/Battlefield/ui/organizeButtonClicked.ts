import { PLAYER_FORCE } from '../../constants';
import * as ListSquads from '../../Squad/ListSquadsScene/ListSquadsScene';
import { MapState, getForceUnits, getForceSquads } from '../Model';

export function organizeButtonClicked(
  {
    turnOff,
    state,
    scene,
  }: {
    turnOff: () => void;
    state: MapState;
    scene: Phaser.Scene;
  },
  onReturnClick: (listSquadScene: ListSquads.ListSquadsScene) => void
) {
  turnOff();

  ListSquads.run(
    {
      units: getForceUnits(state, PLAYER_FORCE),
      squads: getForceSquads(state, PLAYER_FORCE).map((s) => s.squad),
      dispatched: state.dispatchedSquads,
      onReturnClick: (listSquadScene) => onReturnClick(listSquadScene),
    },
    scene.scene.manager
  );
}
