import { GAME_SPEED } from '../../env';
import { cellSize } from '../config';
import { getChara, getMapSquad, MapState } from '../Model';

export default async function (scene: Phaser.Scene, state: MapState) {
  // TODO: make this a create parameter, as we don't need to store this for later
  if (state.squadToPush) {
    state.isPaused = true;
    const loser = getMapSquad(state, state.squadToPush.loser);

    const { direction } = state.squadToPush;
    const dist = cellSize;
    let xPush = 0;
    let yPush = 0;
    if (direction === 'left') xPush = dist * -1;
    if (direction === 'right') xPush = dist;
    if (direction === 'top') yPush = dist * -1;
    if (direction === 'bottom') yPush = dist;

    const chara = getChara(state, loser.id);

    const newPos = {
      x: chara.container.x + xPush,
      y: chara.container.y + yPush,
    };

    return new Promise((resolve) => {
      scene.add.tween({
        targets: chara.container,
        duration: 1000 / GAME_SPEED,
        ...newPos,
        onComplete: () => {
          chara.container.setPosition(newPos.x, newPos.y);
          state.squads = state.squads.setIn([loser.id, 'pos'], newPos);
          state.squadToPush = null;
          state.isPaused = false;
          resolve();
        },
      });
    }) as Promise<void>;
  } else return Promise.resolve();
}
