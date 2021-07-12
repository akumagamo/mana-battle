export type SelectStateModel = {
  items: any[];
  container: Phaser.GameObjects.Container;
  prop: 'hair' | 'skinColor' | 'hairColor';
  index: number;
  label: string;
  x: number;
  y: number;
  scene: Phaser.Scene;
};
