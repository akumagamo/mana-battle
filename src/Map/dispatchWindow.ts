import { Set } from "immutable";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../constants";
import { getSquads } from "../DB";
import { delay } from "../Scenes/utils";
import button from "../UI/button";
import panel from "../UI/panel";
import text from "../UI/text";
import { MapScene } from "./MapScene";

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
  container.add(close)
  close.setOrigin(0.5);
  close.setScale(0.7)
  close.setInteractive();
  close.on("pointerup", () => {
    container.destroy();
    scene.enableInput();
  });


  // TODO: avoid listing defeated squads
  let squadsToRender = scene.getPlayerSquads().filter(
    (sqd) => !scene.state.dispatchedSquads.has(sqd.id)
  );

  squadsToRender.forEach((sqd, i) => {
    const event = async () => {
      container.destroy();

      await scene.dispatchSquad(sqd);
      scene.enableInput();

      await delay(scene, 100);

      scene.changeMode({ type: "SQUAD_SELECTED", id: sqd.id });

      let squad = scene.getSquad(sqd.id);
      scene.signal("clicked dispatch squad button", [
        { type: "CLICK_SQUAD", unit: squad },
        {
          type: "MOVE_CAMERA_TO",
          x: squad.pos.x,
          y: squad.pos.y,
          duration: 500,
        },
      ]);
    };
    button(
      x + padding,
      y + 60 + 70 * i,
      sqd.name,
      container,
      scene,
      event,
      false,
      width - padding * 2
    );
  });
};
