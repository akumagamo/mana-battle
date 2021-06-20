import { createEvent } from "../../utils";

export const key = "ReturnedFromCombat";

export default (scene: Phaser.Scene) => createEvent<null>(scene.events, key);
