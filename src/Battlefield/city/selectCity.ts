import {MapScene} from "../MapScene";
import {getCity} from "../Model";
import signal from "../signal";
import {refreshUI} from "../ui";

export default  async function(scene: MapScene, id: string) {
    refreshUI(scene);
    const { x, y } = getCity(scene.state, id);

    signal(scene, "selectCity", [
      { type: "MOVE_CAMERA_TO", x, y, duration: 500 },
    ]);
  }
