import { PLAYER_FORCE } from "../../constants";
import * as ListSquads from "../../Squad/ListSquadsScene";
import { Map } from "immutable";
import { toMapSquad } from "../../Unit/Model";
import { MapState } from "../Model";
import { getCity } from "../MapScene";

export function organize(state: MapState, manager: Phaser.Scenes.SceneManager) {

  manager.stop("MapScene");

  ListSquads.run(
    {
      units: state.units.filter((u) => u.force === PLAYER_FORCE),
      squads: state.squads
        .filter((s) => s.squad.force === PLAYER_FORCE)
        .map((s) => s.squad)
        .reduce((xs, x) => xs.set(x.id, x), Map()),
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
