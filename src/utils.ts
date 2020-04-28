export function random(min: number, max: number) {
  return Math.floor(Math.random() * max + min);
}

export function removeIdFromMap(id: string, map: {[id: string]: {id: string}}) {
  return Object.values(map).reduce(
    (acc, curr) => (curr.id === id ? acc : {...acc, [curr.id]: curr}),
    {},
  );
}

export const indexById = (list: {id: string}[]) =>
  list.reduce((acc, curr) => ({...acc, [curr.id]: curr}), {});

export const sceneLinkButton = (
  scene: Phaser.Scene,
  text: string,
  x: number,
  y: number,
  clearFunction: Function,
  targetScene: string,
) => {
  const button = scene.add.text(x, y, text);
  button.setInteractive();
  button.on('pointerdown', () => {
    clearFunction();
    scene.scene.transition({
      target: targetScene,
      duration: 0,
      moveBelow: true,
    });
  });
  return button;
};

export const maybeZero = (v:number|undefined|null)=> v ? v : 0
