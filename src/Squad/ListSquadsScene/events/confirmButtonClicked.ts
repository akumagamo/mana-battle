import { createEvent } from "../../../utils";

export const key = "ConfirmButtonClicked";

export default (scene: Phaser.Scene) => createEvent<null>(scene.events, key);
