export default (scene: Phaser.Scene) => ({x, y}: {x: number; y: number}) => {
  const grass = scene.add.image(x, y, 'props/grass');
  grass.setScale(0.4);
  grass.setOrigin(0.5, 1);
  grass.setRotation(-0.2);

  scene.tweens.add({
    targets: grass,
    rotation: 0.2,
    scaleX: 0.5,
    duration: 1000 * Math.random() + 5000,
    repeat: -1,
    yoyo: true,
    ease: 'Bounce',
  });

  return grass
};
