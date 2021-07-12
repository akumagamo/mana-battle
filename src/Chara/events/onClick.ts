import { Pointer } from "../../Models";
import { Chara } from "../Model";

export default (chara: Chara, fn: (chara: Chara) => void) => {
  chara.container.setInteractive();

  chara.container.on("pointerdown", (_pointer: Pointer) => {
    fn(chara);
  });
};
