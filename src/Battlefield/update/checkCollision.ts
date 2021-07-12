import { getDistance } from "../../utils";
import startCombat from "../squads/startCombat";
import { cellSize } from "../config";
import { getChara, getMapSquad, MapState } from "../Model";

export function checkCollision(
  state: MapState,
  scene: Phaser.Scene,
  direction: string
) {
  return (sqd: string) => {
    const current = getChara(state, sqd);

    // TODO: only enemies
    // how: have indexes per team
    return state.charas
      .filter((c) => {
        const a = getMapSquad(state, c.props.unit.squad).squad.force;
        const b = getMapSquad(state, sqd).squad.force;

        return a !== b;
      })
      .find((c) => {
        const distance = getDistance(c.container, current.container);

        return distance < cellSize * 0.8;
        // startCombat(
        //   scene,
        //   state,
        //   getMapSquad(state, sqd),
        //   getMapSquad(state, c.props.unit.squad),
        //   direction
        // );
        //}
      });
  };
}
