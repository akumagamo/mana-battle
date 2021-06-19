import {createEvent} from "../../../utils";

export function handleOptionButtonClicked(scene: Phaser.Scene) {
  scene.scene.transition({
    target: 'OptionsScene',
    duration: 0,
    moveBelow: true,
  });
}

export const key = "OptionsButtonClicked";

export const OptionsButtonClicked = (scene: Phaser.Scene) => createEvent<Phaser.Scene>(scene, key)
