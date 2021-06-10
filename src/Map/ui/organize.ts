import { PLAYER_FORCE } from "../../constants";
import * as ListSquads from "../../Squad/ListSquadsScene";
import { Map } from "immutable";
import { toMapSquad } from "../../Unit/Model";
import { MapState } from "../Model";
import { getCity, getForceUnits, getForceSquads } from "../MapScene";
import { indexById } from "../../utils";

export function organize(state: MapState, manager: Phaser.Scenes.SceneManager) {
  manager.stop("MapScene");

  ListSquads.run(
    {
      units: getForceUnits(state, PLAYER_FORCE),
      squads: getForceSquads(state, PLAYER_FORCE).map((s) => s.squad),
      dispatched: state.dispatchedSquads,
      onReturnClick: (listSquadScene) => {
        state.units = state.units.merge(listSquadScene.units);
        listSquadScene.squads.forEach(async (squad) => {
          const isExistingSquad = state.squads.get(squad.id);

          if (isExistingSquad)
            state.squads = state.squads.update(squad.id, (sqd) => ({
              ...sqd,
              squad: squad,
            }));
          else {
            const force = state.forces.find(
              (force) => force.id === squad.force
            );

            // TODO: create 'addSquadToMapScene' method
            const city = await getCity(state, force.initialPosition);

            const mapSquad = toMapSquad(squad, { x: city.x, y: city.y });
            state.squads = state.squads.set(squad.id, mapSquad);
          }
        });
        listSquadScene.scene.stop();
        manager.start("MapScene", []);
      },
    },
    manager
  );
}
