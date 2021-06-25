import { createEvent } from "../../utils";

export const key = "OrganizeButtonClicked";

export default (scene: Phaser.Scene) =>
  createEvent<Phaser.Scene>(scene.events, key);
