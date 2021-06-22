import { createEvent } from "../../utils";

export const key = "CombatInitiated";

export default (scene: Phaser.Scene) => createEvent<null>(scene.events, key);
