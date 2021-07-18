import { PLAYER_FORCE } from "../../constants";
import { getPathTo } from "../api";
import { screenToCellPosition } from "../board/position";
import { getForceCities, getMapSquad, MapState } from "../Model";
import moveSquadTo from "../squads/moveSquadTo";

export default function (state: MapState) {
  state.ai = state.ai.map((cmd, eid) => {
    if (cmd === "DEFEND") {
      return cmd;
    } else if (cmd === "ATTACK") {
      const squad = getMapSquad(state, eid);
      const cities = getForceCities(state, PLAYER_FORCE);

      const distances = cities
        .map((city) => {
          const path = getPathTo(state.cells)(screenToCellPosition(squad.posScreen))({
            x: city.x,
            y: city.y,
          });

          const [x, y] = path[path.length - 1];

          return { id: city.id, target: { x, y }, distance: path.length };
        })
        .sort((a, b) => a.distance - b.distance);

      if (distances.length < 1) return "DEFEND";

      const [target] = distances;

      moveSquadTo(state, squad.id, target.target);

      return "MOVING";
    }

    return cmd;
  });
}
