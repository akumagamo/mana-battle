import { Vector } from "matter";
import { GAME_SPEED } from "../../env";
import { tween } from "../../Scenes/utils";

export function pingEffect(scene: Phaser.Scene, pointer: Vector) {
  var ping = scene.add.image(pointer.x, pointer.y, "ping");
  ping.setScale(0.1);

  tween(scene, {
    targets: ping,
    alpha: 0,
    duration: 300 / GAME_SPEED,
    scale: 0.6,
  });
  handlePhaserTweenInterruptionBug(scene, ping);
}
function handlePhaserTweenInterruptionBug(
  scene: Phaser.Scene,
  ping: Phaser.GameObjects.Image
) {
  scene.time.addEvent({
    delay: 300 / GAME_SPEED,
    callback: () => {
      ping.destroy();
    },
  });
}
