import { PLAYER_FORCE } from "../../../constants";
import { MapScene } from "../../../Battlefield/MapScene";
import { getCity, getForceSquads } from "../../../Battlefield/Model";
import { toMapSquad } from "../../../Unit/Model";
import { ListSquadsScene } from "../../ListSquadsScene/ListSquadsScene";
import { SquadRecord } from "../../Model";

const returnButtonClicked = (mapScene: MapScene) => (
  listSquadScene: ListSquadsScene
) => {
  mapScene.state.units = mapScene.state.units.merge(listSquadScene.units);
  removeDisbandedSquads(listSquadScene, mapScene);

  listSquadScene.squads.forEach(async (squad) => {
    const isExistingSquad = mapScene.state.squads.get(squad.id);
    if (isExistingSquad) {
      updateExistingSquad(mapScene, squad);
    } else {
      addNewSquad(mapScene, squad);
    }
  });

  mapScene.scene.manager.stop("ListSquadsScene");
  mapScene.scene.manager.start("MapScene", []);
};

function addNewSquad(mapScene: MapScene, squad: SquadRecord) {
  const force = mapScene.state.forces.find((force) => force.id === squad.force);

  // TODO: create 'addSquadToMapScene' method
  const city = getCity(mapScene.state, force.initialPosition);

  const mapSquad = toMapSquad(squad, { x: city.x, y: city.y });
  mapScene.state.squads = mapScene.state.squads.set(squad.id, mapSquad);
}

function updateExistingSquad(mapScene: MapScene, squad: SquadRecord) {
  mapScene.state.squads = mapScene.state.squads.update(squad.id, (sqd) => ({
    ...sqd,
    squad: squad,
  }));
}

function removeDisbandedSquads(
  listSquadScene: ListSquadsScene,
  mapScene: MapScene
) {
  const removedSquads = getForceSquads(mapScene.state, PLAYER_FORCE).filter(
    (sqd) => !listSquadScene.squads.some((s) => s.id === sqd.id)
  );

  removedSquads.forEach((sqd) => {
    mapScene.state.squads = mapScene.state.squads.delete(sqd.id);
  });
}

export default returnButtonClicked;
