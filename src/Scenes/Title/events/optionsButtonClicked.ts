export function optionsButtonClicked(scene: Phaser.Scene) {
  scene.scene.transition({
    target: 'OptionsScene',
    duration: 0,
    moveBelow: true,
  });
}
