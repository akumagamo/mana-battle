import { GAME_SPEED } from "../../env";
import speech from "../../UI/speech";
import SquadArrivedInfoMessageClosed from "../events/SquadArrivedInfoMessageClosed";
import { getSquadLeader, MapSquad, MapState } from "../Model";

export default function (
  scene: Phaser.Scene,
  state: MapState,
  squad: MapSquad,
  message: string
) {
  const leader = getSquadLeader(state, squad.id);
  const speechWindow = speech(
    leader,
    450,
    -200,
    message,
    state.uiContainer,
    scene
  );

  scene.tweens.add({
    targets: speechWindow,
    y: 20,
    ease: "Cubic",
    duration: 1000 / GAME_SPEED,
    onComplete: () => {
      scene.tweens.add({
        delay: 1000 / GAME_SPEED,
        targets: speechWindow,
        y: -200,
        ease: "Cubic",
        duration: 1000 / GAME_SPEED,
        onComplete: () => {
          SquadArrivedInfoMessageClosed(scene).emit(speechWindow);
        },
      });
    },
  });

  state.uiContainer.add(speechWindow);

  return speechWindow;
}
