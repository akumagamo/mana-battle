import { PLAYER_FORCE } from '../../../constants';
import { MapScene } from '../../../Battlefield/MapScene';
import { getCity, getForceSquads, MapState } from '../../../Battlefield/Model';
import { toMapSquad } from '../../../Unit/Model';
import { ListSquadsScene } from '../../ListSquadsScene/ListSquadsScene';
import { SquadRecord } from '../../Model';

const returnButtonClicked = (mapScene: MapScene, state: MapState) => (
  listSquadScene: ListSquadsScene
) => {
  state.units = state.units.merge(listSquadScene.units);
  removeDisbandedSquads(listSquadScene, state);

  listSquadScene.squads.forEach(async (squad) => {
    const isExistingSquad = state.squads.get(squad.id);
    if (isExistingSquad) {
      updateExistingSquad(state, squad);
    } else {
      addNewSquad(state, squad);
    }
  });

  mapScene.scene.manager.stop('ListSquadsScene');
  mapScene.scene.manager.start('MapScene', state);
};

function addNewSquad(state: MapState, squad: SquadRecord) {
  const force = state.forces.find((force) => force.id === squad.force);

  // TODO: create 'addSquadToMapScene' method
  const city = getCity(state, force.initialPosition);

  const mapSquad = toMapSquad(squad, { x: city.x, y: city.y });
  state.squads = state.squads.set(squad.id, mapSquad);
}

function updateExistingSquad(state: MapState, squad: SquadRecord) {
  state.squads = state.squads.update(squad.id, (sqd) => ({
    ...sqd,
    squad: squad,
  }));
}

function removeDisbandedSquads(
  listSquadScene: ListSquadsScene,
  state: MapState
) {
  const removedSquads = getForceSquads(state, PLAYER_FORCE).filter(
    (sqd) => !listSquadScene.squads.some((s) => s.id === sqd.id)
  );

  removedSquads.forEach((sqd) => {
    state.squads = state.squads.delete(sqd.id);
  });
}

export default returnButtonClicked;
