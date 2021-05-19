import {PLAYER_FORCE} from "../../constants";
import {MapScene} from "../MapScene";
import * as ListSquads from "../../Squad/ListSquadsScene";
import {Map} from "immutable";

export function organize(scene: MapScene) {
  console.log("organize btn");

  scene.scene.stop("MapScene");

  // TODO: make all .run calls like this
  ListSquads.run(
    {
      // TODO: only player units
      units: scene.state.units,
      squads: scene.state.squads
        .filter((s) => s.squad.force === PLAYER_FORCE)
        .map((s) => s.squad)
        .reduce((xs, x) => xs.set(x.id, x), Map()),
      dispatched: scene.state.dispatchedSquads,
    },
    scene.scene.manager
  );
}

