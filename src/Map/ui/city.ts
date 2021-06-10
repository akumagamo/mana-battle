import { Container } from "../../Models";
import text from "../../UI/text";
import { getCity, MapScene } from "../MapScene";

export default async (
  scene: MapScene,
  uiContainer: Container,
  baseY: number,
  id: string
): Promise<void> => {
  const city = await getCity(scene.state, id);

  text(20, baseY, city.name, uiContainer, scene);

  if (city.force) {
    const force = scene.getForce(city.force);
    text(1000, baseY, `Controlled by ${force.name}`, uiContainer, scene);
  }
};
