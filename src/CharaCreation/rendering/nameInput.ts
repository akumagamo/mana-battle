import formPanel from './formPanel';

export default function (scene: Phaser.Scene, x: number, y: number) {
  const container = scene.add.container(x, y);
  formPanel(scene, container, 'Character Name', 300, 100);

  var element = scene.add.dom(10, 50).createFromCache('nameform');
  element.setPerspective(800);
  element.setOrigin(0);
  container.add(element);
}
