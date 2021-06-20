import { createEvent } from "../../../utils";
import { SquadRecord } from "../../Model";

export default (scene:Phaser.Scene) =>
  createEvent<SquadRecord>(scene.events, "SquadEditClicked");
