import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../constants";
import button from "../UI/button";
import panel from "../UI/panel";
import text from "../UI/text";
import { enableInput } from "./board/input";
import DispatchWindowRendered from "./events/DispatchWindowRendered";
import SquadClicked from "./events/SquadClicked";
import SquadDispatched from "./events/SquadDispatched";
import { MapScene } from "./MapScene";
import { getMapSquad, MapSquad } from "./Model";
import signal from "./signal";

export default (scene: MapScene) => {
  let container = scene.add.container();

  const x = SCREEN_WIDTH / 4;
  const y = SCREEN_HEIGHT * 0.1;

  const width = SCREEN_WIDTH / 2;
  const height = SCREEN_HEIGHT * 0.7;

  const padding = 40;

  panel(x, y, width, height, container, scene);

  const title = text(
    SCREEN_WIDTH / 2,
    y + 20,
    "Select squad to dispatch",
    container,
    scene
  );
  title.setOrigin(0.5);
  title.setFontSize(24);

  const close = scene.add.image(x + width, y, "close_btn");
  container.add(close);
  close.setOrigin(0.5);
  close.setScale(0.7);
  close.setInteractive();
  close.on("pointerup", () => {
    container.destroy();
    enableInput(scene);
  });

  // TODO: avoid listing defeated squads
  let squadsToRender = scene
    .getPlayerSquads()
    .filter((mapSquad) => !scene.state.dispatchedSquads.has(mapSquad.squad.id));

  squadsToRender.toList().forEach((mapSquad, i) => {
    const leader = scene.getSquadLeader(mapSquad.id);
    button(
      x + padding,
      y + 60 + 70 * i,
      leader.name,
      container,
      scene,
      () => handleDispatchSquad(container, scene, mapSquad),
      false,
      width - padding * 2
    );
  });

  DispatchWindowRendered(scene).emit({
    container,
    scene,
    squads: squadsToRender,
  });
};

export const handleDispatchSquad = async (
  container: Phaser.GameObjects.Container,
  scene: MapScene,
  mapSquad: MapSquad
) => {
  container.destroy();

  scene.dispatchSquad(mapSquad.squad, scene.state.timeOfDay);
  enableInput(scene);
  scene.isPaused = false;
  scene.changeMode({ type: "SQUAD_SELECTED", id: mapSquad.squad.id });

  let squad = getMapSquad(scene.state, mapSquad.squad.id);
  SquadClicked(scene).emit(squad);
  signal(scene, "clicked dispatch squad button", [
    {
      type: "MOVE_CAMERA_TO",
      x: squad.pos.x,
      y: squad.pos.y,
      duration: 500,
    },
  ]);

  SquadDispatched(scene).emit(mapSquad.id);
};
