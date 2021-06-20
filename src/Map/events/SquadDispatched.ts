import { createEvent } from "../../utils";

export const key = "SquadDispatched";

export default (scene: Phaser.Scene) => createEvent<string>(scene.events, key);
