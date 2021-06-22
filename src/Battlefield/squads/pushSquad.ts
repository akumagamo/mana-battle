import { GAME_SPEED } from "../../env";
import { cellSize } from "../config";
import { MapScene } from "../MapScene";
import { getChara, getMapSquad, updateState } from "../Model";

export default async function (scene: MapScene) {
  if (scene.squadToPush) {
    const loser = getMapSquad(scene.state, scene.squadToPush.loser);

    const { direction } = scene.squadToPush;
    const dist = cellSize;
    let xPush = 0;
    let yPush = 0;
    if (direction === "left") xPush = dist * -1;
    if (direction === "right") xPush = dist;
    if (direction === "top") yPush = dist * -1;
    if (direction === "bottom") yPush = dist;

    const chara = getChara(scene, loser.id);

    const newPos = {
      x: chara.container.x + xPush,
      y: chara.container.y + yPush,
    };

    return new Promise((resolve) => {
      scene.add.tween({
        targets: chara.container,
        duration: 1000 / GAME_SPEED,
        x: newPos.x,
        y: newPos.y,
        onComplete: () => {
          scene.squadToPush = null;
          updateState(scene, {
            ...scene.state,
            squads: scene.state.squads.setIn([loser.id, "pos"], newPos),
          });
          resolve();
        },
      });
    }) as Promise<void>;
  } else return Promise.resolve();
}
