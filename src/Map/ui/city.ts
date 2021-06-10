import { Container } from "../../Models";
import text from "../../UI/text";
import { MapScene } from "../MapScene";
import { getCity, getForce } from "../Model";

export default async (
  scene: MapScene,
  uiContainer: Container,
  baseY: number,
  id: string
): Promise<void> => {
  const city = getCity(scene.state, id);

  text(20, baseY, city.name, uiContainer, scene);

  if (city.force) {
    const force = getForce(scene.state, city.force);
    text(1000, baseY, `Controlled by ${force.name}`, uiContainer, scene);
  }
};
