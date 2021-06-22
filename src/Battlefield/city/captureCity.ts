import { MapScene } from "../MapScene";

export default function (
  scene: MapScene,
  cmd: {
    type: "CAPTURE_CITY";
    id: string;
    force: string;
  }
) {
  scene.state.cities = scene.state.cities.map((city) =>
    city.id === cmd.id ? { ...city, force: cmd.force } : city
  );
}
