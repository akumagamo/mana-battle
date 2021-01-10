import { delay } from "../../Scenes/utils";
import TheaterScene from "../TheaterScene";

export type WaitCmd = {
  type: "WAIT";
  duration: number;
};

export const wait = (scene: TheaterScene, cmd: WaitCmd) =>
  delay(scene, cmd.duration);
