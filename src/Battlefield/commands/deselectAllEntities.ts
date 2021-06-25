import deselectChara from "../../Chara/commands/deselectChara";
import {MapState} from "../Model";

export default function deselectAllEntities(state: MapState) {
  state.charas.forEach(deselectChara);
  state.citySprites.forEach((c) => c.selectedIndicator?.destroy());
}

