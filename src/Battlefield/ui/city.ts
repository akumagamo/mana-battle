import { Container } from "../../Models";
import text from "../../UI/text";
import { getCity, getForce, MapState } from "../Model";

export default async (
  scene: Phaser.Scene,
  state: MapState,
  uiContainer: Container,
  baseY: number,
  id: string
): Promise<void> => {
  const city = getCity(state, id);

  text(20, baseY, city.name, uiContainer, scene);

  if (city.force) {
    const force = getForce(state, city.force);
    if (force)
      text(1000, baseY, `Controlled by ${force.name}`, uiContainer, scene);
  }
};
