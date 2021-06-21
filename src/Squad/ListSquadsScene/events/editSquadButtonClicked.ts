import { createEvent } from "../../../utils";
import { SquadRecord } from "../../Model";

export const key = "SquadEditClicked";
export default (scene: Phaser.Scene) =>
  createEvent<SquadRecord>(scene.events, key);
