import { createEvent } from "../../utils";

export default (scene: Phaser.Scene) =>
  createEvent<null>(scene.events, "CombatInitiated");
