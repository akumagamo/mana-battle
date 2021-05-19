import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants";
import { Container } from "../../Models";
import panel from "../../UI/panel";
import text from "../../UI/text";
import { MapScene } from "../MapScene";
import city from "./city";
import { squadInfo } from "./squadInfo";

const BOTTOM_PANEL_WIDTH = SCREEN_WIDTH;
const BOTTOM_PANEL_HEIGHT = 80;
const BOTTOM_PANEL_X = 0;
export const BOTTOM_PANEL_Y = SCREEN_HEIGHT - BOTTOM_PANEL_HEIGHT;

export default (scene: MapScene, uiContainer: Container): Promise<void> => {
  if (scene.mode.type === "NOTHING_SELECTED") return;

  const baseY = BOTTOM_PANEL_Y + 25;

  panel(
    BOTTOM_PANEL_X,
    BOTTOM_PANEL_Y,
    BOTTOM_PANEL_WIDTH,
    BOTTOM_PANEL_HEIGHT,
    uiContainer,
    scene
  );

  switch (scene.mode.type) {
    case "SQUAD_SELECTED":
      return squadInfo(scene, uiContainer, baseY, scene.mode.id);
    case "MOVING_SQUAD":
      return squadInfo(scene, uiContainer, baseY, scene.mode.id);
    case "CITY_SELECTED":
      return city(scene, uiContainer, baseY, scene.mode.id);
    case "SELECT_SQUAD_MOVE_TARGET":
      return new Promise(() => {
        panel(SCREEN_WIDTH / 2, 10, 220, 50, uiContainer, scene);
        text(
          SCREEN_WIDTH / 2 + 10,
          14,
          "Select Destination",
          uiContainer,
          scene
        );
      });
    default:
      return;
  }
};
