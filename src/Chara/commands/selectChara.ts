import { createImage } from "../../Browser/phaser";
import { createEvent } from "../../utils";
import { Chara } from "../Model";

const event = (
  emitter: Phaser.Events.EventEmitter | Phaser.GameObjects.GameObject
) => createEvent<Chara>(emitter, "selectChara");

export default function selectChara(chara: Chara) {
  const selected = createImage(chara.scene, "chara/selected_chara", 0, 100);
  selected.setScale(0.5);

  chara.selectedCharaIndicator = selected;
  chara.container.add(selected);
  chara.container.sendToBack(selected);
}

export function subscribe(chara: Chara) {
  event(chara.container).on(selectChara);
}

export function emit(chara: Chara) {
  event(chara.container).emit(chara);
}
