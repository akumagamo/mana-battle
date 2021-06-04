import { PLAYER_FORCE } from "../../constants";
import { MapScene } from "../MapScene";
import * as ListSquads from "../../Squad/ListSquadsScene";
import { Map } from "immutable";
import { toMapSquad } from "../../Unit/Model";

export function organize(scene: MapScene) {
  console.log("organize btn");

  const sceneManager = scene.scene.manager;

  sceneManager.stop("MapScene");
  ListSquads.run(
    {
      units: scene.state.units.filter((u) => u.force === PLAYER_FORCE),
      squads: scene.state.squads
        .filter((s) => s.squad.force === PLAYER_FORCE)
        .map((s) => s.squad)
        .reduce((xs, x) => xs.set(x.id, x), Map()),
      dispatched: scene.state.dispatchedSquads,
      onReturnClick: (listSquadScene) => {
        scene.state.units = scene.state.units.merge(listSquadScene.units);
        listSquadScene.squads.forEach(async (squad) => {
          const isExistingSquad = scene.state.squads.get(squad.id);

          if (isExistingSquad)
            scene.state.squads = scene.state.squads.update(squad.id, (sqd) => ({
              ...sqd,
              squad: squad,
            }));
          else {
            const force = scene.state.forces.find(
              (force) => force.id === squad.force
            );

            // TODO: create 'addSquadToMapScene' method
            const city = await scene.getCity(force.initialPosition);

            const mapSquad = toMapSquad(squad, { x: city.x, y: city.y });
            scene.state.squads = scene.state.squads.set(squad.id, mapSquad);
          }
        });
        listSquadScene.scene.stop();
        scene.scene.start("MapScene", []);
      },
    },
    sceneManager
  );
}
