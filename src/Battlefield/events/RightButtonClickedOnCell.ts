import { Vector } from "matter";
import { GAME_SPEED } from "../../env";
import { tween } from "../../Scenes/utils";
import { createEvent } from "../../utils";
import { MapState } from "../Model";
import signal from "../signal";

export const key = "RightButtonClickedOnCell";

export default (scene: Phaser.Scene) =>
  createEvent<{
    scene: Phaser.Scene;
    state: MapState;
    tile: Vector;
    pointer: Vector;
  }>(scene.events, key);
