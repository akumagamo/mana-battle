import { GAME_SPEED } from "../../env";
import { screenToCellPosition } from "../board/position";
import { cellSize } from "../config";
import { getChara, getMapSquad, MapSquad, MapState } from "../Model";
import moveSquadTo from "./moveSquadTo";

export default async function (scene: Phaser.Scene, state: MapState) {
  // TODO: make this a create parameter, as we don't need to store this for later
  if (state.squadToPush) {

    const { loser, direction } = state.squadToPush;
    state.isPaused = true;

    const pushedSquad = getMapSquad(state, loser);

    const dist = cellSize;
    let xPush = 0;
    let yPush = 0;
    if (direction === "left") xPush = dist * -1;
    if (direction === "right") xPush = dist;
    if (direction === "top") yPush = dist * -1;
    if (direction === "bottom") yPush = dist;

    const chara = getChara(state, pushedSquad.id);

    const newPos = {
      x: chara.container.x + xPush,
      y: chara.container.y + yPush,
    };

    const targetCell = screenToCellPosition(newPos);

    const cellType = state.cells[targetCell.y][targetCell.x];

    if (cellType === 3) {
      state.isPaused = false;
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      scene.add.tween({
        targets: chara.container,
        duration: 1000 / GAME_SPEED,
        ...newPos,
        onComplete: () => {
          chara.container.setPosition(newPos.x, newPos.y);

          const updatedSquad: MapSquad = { ...pushedSquad, posScreen: newPos };
          state.squads = state.squads.set(pushedSquad.id, updatedSquad);

          if (state.squadsInMovement.has(pushedSquad.id)) {
            moveSquadTo(
              state,
              pushedSquad.id,
              state.squadsInMovement.get(pushedSquad.id)?.path.reverse()[0] || {
                x: 0,
                y: 0,
              }
            );
          }

          state.isPaused = false;
          resolve();
        },
      });
    }) as Promise<void>;
  } else return Promise.resolve();
}
