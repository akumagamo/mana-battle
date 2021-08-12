import { GAME_SPEED } from "../../env";
import { Chara } from "../Model";

const ATTACK_DURATION = 500;

export default async (chara: Chara) =>
  new Promise<void>((resolve) => {
    chara.cast();

    chara.scene.time.addEvent({
      delay: ATTACK_DURATION / GAME_SPEED,
      callback: () => {
        resolve();
      },
    });

    // TODO: refactor to Sound.play.fireball()
    if (process.env.SOUND_ENABLED) {
      chara.scene.sound.add("fireball").play();
    }
  });
