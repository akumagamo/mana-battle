import { GAME_SPEED } from "../../env";
import button from "../../UI/button";
import speech from "../../UI/speech";
import SquadArrivedInfoMessageClosed from "../events/SquadArrivedInfoMessageClosed";
import { MapScene } from "../MapScene";
import { MapSquad } from "../Model";

export default async function (scene: MapScene, squad: MapSquad) {
  scene.isPaused = true;

  const leader = scene.getSquadLeader(squad.id);
  const res = await speech(
    leader,
    450,
    70,
    "We arrived at the target destination.",
    scene.uiContainer,
    scene,
    GAME_SPEED
  );

  button(950, 180, "Ok", scene.uiContainer, scene, () =>
    SquadArrivedInfoMessageClosed(scene).emit(res.portrait)
  );

  scene.uiContainer.add(res.portrait.container);

  return res.portrait;
}
