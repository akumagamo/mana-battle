const PUBLIC_URL = 'assets';

export function preload(this: {
  load: {
    image: (key: string, path: string) => void;
  };
  preload: () => void;
  create: (this: { preload: () => void; create: () => void }) => void;
}) {
  const images = ['insignea', 'tile', 'hand', 'foot', 'backgrounds/plain', 'backgrounds/squad_edit'];

  images.forEach(str => this.load.image(str, PUBLIC_URL + '/' + str + '.svg'));

  const numbers = [1, 2, 3, 4];
  numbers.forEach((n: number) => {
    this.load.image('head' + n.toString(), PUBLIC_URL + '/head.svg');
    this.load.image('back_head' + n.toString(), PUBLIC_URL + '/back_head.svg');
  });
  numbers.forEach((n: number) => {
    this.load.image('trunk' + n.toString(), PUBLIC_URL + '/trunk.svg');
    this.load.image(
      'back_trunk' + n.toString(),
      PUBLIC_URL + '/back_trunk.svg'
    );
  });

  const ui = ['arrow_right', 'panel'];
  ui.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/ui/${id}.svg`);
  });

  const items = ['amulet',
    'iron_armor', 'iron_shield','iron_sword',
    'steel_armor', 'steel_shield','steel_sword',
    'baldar_armor', 'baldar_shield','baldar_sword',
  ];
  items.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/items/${id}.png`);
  });

  const equips = [
    'equips/iron_sword',
    'equips/steel_sword',
    'equips/baldar_sword',
  ];
  equips.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/${id}.svg`);
  });

  const props = ['props/grass', 'props/bush', 'props/far_tree_1', 'props/branch'];
  props.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/${id}.svg`);
  });

  const tiles = ['tiles/grass', 'tiles/woods', 
    'tiles/mountain1', 'tiles/mountain2',
'tiles/mountain3', 'tiles/mountain4',

'tiles/mountain5', 'tiles/mountain6',
'tiles/mountain7', 'tiles/mountain8',

  ];
  tiles.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/${id}.svg`);
  });

}
