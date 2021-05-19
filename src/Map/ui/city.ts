import { PLAYER_FORCE } from "../../constants";
import { Container } from "../../Models";
import button from "../../UI/button";
import text from "../../UI/text";
import dispatchWindow from "../dispatchWindow";
import { MapScene } from "../MapScene";

export default async (
  scene: MapScene,
  uiContainer: Container,
  baseY: number,
  id: string
): Promise<void> => {
  const city = await scene.getCity(id);

  text(20, baseY, city.name, uiContainer, scene);

  if (city.force) {
    const force = await scene.getForce(city.force);
    text(1000, baseY, `Controlled by ${force.name}`, uiContainer, scene);
  }
};
