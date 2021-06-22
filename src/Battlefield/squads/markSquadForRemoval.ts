import { MapScene } from '../MapScene';

export default function (scene: MapScene, id: string) {
  scene.state.squadsToRemove = scene.state.squadsToRemove.add(id);
}
