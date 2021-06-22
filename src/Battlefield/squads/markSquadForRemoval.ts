import { MapScene } from "../MapScene";

export default function (scene: MapScene, id: string) {
  scene.squadsToRemove = scene.squadsToRemove.add(id);
}
