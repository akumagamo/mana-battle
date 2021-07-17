import { INVALID_STATE } from "../../errors";
import { getDistance } from "../../utils";
import { cellSize } from "../config";
import { getChara, getMapSquad, MapState } from "../Model";

export function checkCollision(state: MapState) {
  return (sqd: string) => {
    const current = getChara(state, sqd);

    if (!current) throw new Error(INVALID_STATE);

    // TODO: only enemies
    // how: have indexes per team
    return state.charas
      .filter((c) => {
        const squad = state.unitSquadIndex.get(c.props.unit.id);

        if (!squad) throw new Error(INVALID_STATE);

        const a = getMapSquad(state, squad).squad.force;
        const b = getMapSquad(state, sqd).squad.force;

        return a !== b;
      })
      .find((c) => {
        const distance = getDistance(c.container, current.container);

        return distance < cellSize * 0.8;
      });
  };
}
