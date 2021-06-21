import { createEvent } from "../../../utils";

export const key = "CreateSquadClicked";
export default (scene: Phaser.Scene) => createEvent<null>(scene.events, key);
